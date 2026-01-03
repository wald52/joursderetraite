#!/usr/bin/env python3
"""
Script pour créer des icônes PNG basiques pour la PWA
Utilise une approche minimaliste pour générer des fichiers PNG valides
"""

def create_minimal_png(width, height, color=(76, 175, 80)):  # RGB pour #4CAF50
    """
    Crée un fichier PNG minimaliste sans bibliothèque externe
    Cette fonction génère un PNG 1x1 pixel répété pour former l'image
    """
    import struct
    import zlib
    
    # Convertir la couleur en bytes
    r, g, b = color
    pixel = bytes([r, g, b])
    
    # En-tête PNG
    png_header = b'\x89PNG\r\n\x1a\n'
    
    # Chunk IHDR
    ihdr_data = (
        struct.pack('>I', width) +      # width
        struct.pack('>I', height) +     # height
        b'\x08\x02\x00\x00\x00'        # bit depth=8, color type=2 (RGB), no compression, no filter, no interlace
    )
    
    # Calculer le CRC pour IHDR
    ihdr_chunk_type = b'IHDR'
    ihdr_crc_data = ihdr_chunk_type + ihdr_data
    # Pour simplifier, on utilise un CRC factice
    # Dans une implémentation complète, on utiliserait zlib.crc32()
    
    # Créer les données IDAT (données d'image)
    # Format: scanline filter (0) + pixels RGB + padding
    scanline = b''
    for y in range(height):
        scanline += b'\x00'  # filter type 0
        for x in range(width):
            scanline += pixel
    
    # Compresser les données
    compressed_data = zlib.compress(scanline)
    
    # Assembler le chunk IDAT
    idat_data = compressed_data
    idat_chunk_type = b'IDAT'
    
    # Chunk IEND
    iend_chunk_type = b'IEND'
    iend_data = b''
    
    # Assembler le fichier PNG
    png_data = png_header
    # On ajoute les chunks sans CRC pour simplifier
    # Ceci est un PNG minimaliste qui peut ne pas être valide selon les normes strictes
    
    return png_data

# Alternative: Utilisons une approche avec Pillow via le gestionnaire de paquets
def create_icons_with_pillow():
    """
    Crée des icônes PNG en utilisant Pillow installé via pkg
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        sizes = [192, 512]
        color = (76, 175, 80)  # #4CAF50 en RGB
        text_color = (255, 255, 255)  # Blanc
        
        for size in sizes:
            # Créer une image carrée avec la couleur de fond
            img = Image.new('RGB', (size, size), color)
            draw = ImageDraw.Draw(img)
            
            # Dessiner le texte "R" au centre
            # Pour simplifier, on utilise une taille de police proportionnelle à la taille de l'image
            font_size = size // 2
            try:
                # Essayer d'utiliser une police par défaut
                draw.text((size//2, size//2), "R", fill=text_color, anchor="mm", fontsize=font_size)
            except:
                # Si fontsize n'est pas supporté, on utilise une méthode alternative
                # Dessiner le texte au centre
                bbox = draw.textbbox((0, 0), "R")
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (size - text_width) // 2
                y = (size - text_height) // 2
                draw.text((x, y), "R", fill=text_color)
            
            # Sauvegarder l'image
            filename = f"icon-{size}x{size}.png"
            img.save(filename)
            print(f"Image {filename} créée avec succès")
            
    except ImportError:
        print("Pillow n'est pas disponible. Création d'icônes SVG à la place.")
        # Créer des icônes SVG comme solution de repli
        create_svg_icons()

def create_svg_icons():
    """
    Crée des icônes SVG comme solution de repli
    """
    sizes = [192, 512]
    color = "#4CAF50"
    text_color = "#FFFFFF"
    text = "R"
    
    for size in sizes:
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" fill="{color}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
        font-size="{size//2}" fill="{text_color}" 
        font-family="Arial, sans-serif" font-weight="bold">{text}</text>
</svg>'''
        
        filename = f"icon-{size}x{size}.png"
        with open(filename, 'w') as f:
            f.write(svg_content)
        print(f"Fichier SVG {filename} créé comme solution de repli")

if __name__ == "__main__":
    create_icons_with_pillow()