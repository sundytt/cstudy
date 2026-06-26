import zipfile
import base64
import json
import os

def extract_images_from_docx(docx_path):
    images = {}
    
    with zipfile.ZipFile(docx_path, 'r') as z:
        for name in z.namelist():
            if name.startswith('word/media/'):
                with z.open(name) as f:
                    img_data = f.read()
                    ext = os.path.splitext(name)[1].lower()
                    if ext == '.jpg':
                        mime_type = 'image/jpeg'
                    elif ext == '.png':
                        mime_type = 'image/png'
                    else:
                        mime_type = 'image/' + ext[1:]
                    
                    base64_data = base64.b64encode(img_data).decode('utf-8')
                    images[name] = {
                        'mime_type': mime_type,
                        'base64': base64_data,
                        'size': len(img_data)
                    }
    
    return images

def extract_text_with_images(docx_path):
    import xml.etree.ElementTree as ET
    
    ns = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture'
    }
    
    with zipfile.ZipFile(docx_path, 'r') as z:
        doc_content = z.read('word/document.xml').decode('utf-8')
        root = ET.fromstring(doc_content)
        
        try:
            rels_content = z.read('word/_rels/document.xml.rels').decode('utf-8')
            rels_root = ET.fromstring(rels_content)
            image_rels = {}
            for rel in rels_root.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
                target = rel.get('Target')
                if target and target.startswith('media/'):
                    image_rels[rel.get('Id')] = target
        except:
            image_rels = {}
        
        images = extract_images_from_docx(docx_path)
        
        elements = []
        current_text = ''
        
        for body in root.findall('w:body', ns):
            for child in body.iter():
                if child.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t':
                    current_text += child.text if child.text else ''
                elif child.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tab':
                    current_text += '\t'
                elif child.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p':
                    if current_text.strip():
                        elements.append({'type': 'text', 'content': current_text.strip()})
                        current_text = ''
                elif child.tag == '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}inline':
                    if current_text.strip():
                        elements.append({'type': 'text', 'content': current_text.strip()})
                        current_text = ''
                    
                    blip = child.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip', ns)
                    if blip is not None:
                        embed_attr = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                        if embed_attr and embed_attr in image_rels:
                            image_path = 'word/' + image_rels[embed_attr]
                            if image_path in images:
                                elements.append({
                                    'type': 'image',
                                    'image_path': image_path,
                                    'base64': images[image_path]['base64'],
                                    'mime_type': images[image_path]['mime_type']
                                })
        
        if current_text.strip():
            elements.append({'type': 'text', 'content': current_text.strip()})
    
    return elements

def main():
    docx_files = ['多邻国英语学习错误题集.docx', '英语口语练习汇总.docx']
    all_data = {}
    
    for docx_file in docx_files:
        print(f"Processing {docx_file}...")
        elements = extract_text_with_images(docx_file)
        all_data[docx_file] = elements
        print(f"Found {len([e for e in elements if e['type'] == 'image'])} images")
    
    output_file = 'docs_with_images.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nData saved to {output_file}")

if __name__ == '__main__':
    main()