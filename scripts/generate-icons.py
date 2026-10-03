import zlib
import struct
import math
import os

def create_png(width, height, get_pixel):
    """
    Creates an RGBA PNG file byte string using built-in zlib and struct.
    get_pixel(x, y) returns (r, g, b, a) where each is 0-255.
    """
    raw_rows = []
    for y in range(height):
        row = bytearray([0]) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel(x, y)
            row.extend([r, g, b, a])
        raw_rows.append(bytes(row))
    
    compressed_data = zlib.compress(b"".join(raw_rows), 9)

    def make_chunk(chunk_type, data):
        length = struct.pack(">I", len(data))
        crc = struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc

    png_header = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr_chunk = make_chunk(b"IHDR", ihdr_data)
    idat_chunk = make_chunk(b"IDAT", compressed_data)
    iend_chunk = make_chunk(b"IEND", b"")

    return png_header + ihdr_chunk + idat_chunk + iend_chunk

def generate_piano_icon(size):
    """
    Generates a pixel-art piano icon with dark space background, glowing keys,
    golden trim and stars.
    """
    cx = size / 2.0
    cy = size / 2.0
    radius = size * 0.44

    def get_pixel(x, y):
        # Distance from center for rounded icon app background
        dx = x - cx
        dy = y - cy
        dist = math.sqrt(dx * dx + dy * dy)

        # Rounded rectangle mask with border radius ~ 22%
        rx = abs(dx) - (size * 0.5 - size * 0.22)
        ry = abs(dy) - (size * 0.5 - size * 0.22)
        corner_dist = math.sqrt(max(0, rx)**2 + max(0, ry)**2)
        if corner_dist > size * 0.22:
            return (0, 0, 0, 0)

        # Background gradient: deep space midnight blue #080c18 to slate #0f172a
        t = y / float(size)
        bg_r = int(8 + t * 14)
        bg_g = int(12 + t * 18)
        bg_b = int(24 + t * 28)

        # Border rim glow (cyan)
        edge_dist = size * 0.22 - corner_dist
        if 0 <= edge_dist < size * 0.02:
            glow = (size * 0.02 - edge_dist) / (size * 0.02)
            bg_r = int(bg_r * (1 - glow) + 6 * glow)
            bg_g = int(bg_g * (1 - glow) + 182 * glow)
            bg_b = int(bg_b * (1 - glow) + 212 * glow)

        # Draw decorative stars in upper half
        stars = [
            (0.25 * size, 0.20 * size, 0.015 * size),
            (0.75 * size, 0.18 * size, 0.02 * size),
            (0.50 * size, 0.12 * size, 0.012 * size),
            (0.85 * size, 0.35 * size, 0.015 * size),
            (0.15 * size, 0.38 * size, 0.018 * size),
        ]
        for sx, sy, sr in stars:
            s_dist = math.sqrt((x - sx)**2 + (y - sy)**2)
            if s_dist < sr:
                alpha = max(0, 1.0 - s_dist / sr)
                return (int(186 * alpha + bg_r * (1 - alpha)),
                        int(230 * alpha + bg_g * (1 - alpha)),
                        int(253 * alpha + bg_b * (1 - alpha)),
                        255)

        # Piano body area: in bottom 65%
        piano_top = int(size * 0.42)
        piano_bottom = int(size * 0.88)
        piano_left = int(size * 0.12)
        piano_right = int(size * 0.88)

        # Red felt strip & gold trim
        felt_top = piano_top - int(size * 0.04)
        if felt_top <= y < piano_top and piano_left <= x <= piano_right:
            if y == felt_top:
                return (217, 119, 6, 255) # Gold trim line
            return (136, 19, 55, 255) # Red velvet felt

        # Inside keys area
        if piano_top <= y <= piano_bottom and piano_left <= x <= piano_right:
            # 7 white keys across the width
            total_white = 7
            w_width = (piano_right - piano_left) / float(total_white)
            key_idx = int((x - piano_left) / w_width)
            key_x_start = piano_left + key_idx * w_width

            # Black keys definition (between key 0&1, 1&2, 3&4, 4&5, 5&6)
            black_indices = {0, 1, 3, 4, 5}
            black_h = int((piano_bottom - piano_top) * 0.60)
            black_w = w_width * 0.58

            is_in_black = False
            for b_idx in black_indices:
                b_center = piano_left + (b_idx + 1) * w_width
                b_left = b_center - black_w / 2.0
                b_right = b_center + black_w / 2.0
                if b_left <= x <= b_right and piano_top <= y <= (piano_top + black_h):
                    is_in_black = True
                    # Black key styling
                    if x == int(b_left) or x == int(b_right) or y == (piano_top + black_h):
                        return (15, 23, 42, 255) # Border
                    if y == piano_top:
                        return (71, 85, 105, 255) # Top bevel
                    # Accent glow on middle black key
                    if b_idx == 3 or b_idx == 4:
                        return (30, 41, 59, 255)
                    return (15, 23, 42, 255)

            if not is_in_black:
                # White key styling
                # Border line
                if abs(x - key_x_start) < 1.0 or abs(x - (key_x_start + w_width)) < 1.0 or y == piano_bottom:
                    return (203, 213, 225, 255) # Divider
                # Bottom lip
                if y > piano_bottom - int(size * 0.03):
                    return (226, 232, 240, 255)
                # Key body
                # Highlight active key in cyan
                if key_idx == 2 or key_idx == 3:
                    return (240, 249, 255, 255)
                return (248, 250, 252, 255)

        return (bg_r, bg_g, bg_b, 255)

    return create_png(size, height=size, get_pixel=get_pixel)

if __name__ == "__main__":
    os.makedirs("public", exist_ok=True)

    print("Generating icon-192.png...")
    png_192 = generate_piano_icon(192)
    with open("public/icon-192.png", "wb") as f:
        f.write(png_192)

    print("Generating icon-512.png...")
    png_512 = generate_piano_icon(512)
    with open("public/icon-512.png", "wb") as f:
        f.write(png_512)

    print("Generating apple-touch-icon.png...")
    png_180 = generate_piano_icon(180)
    with open("public/apple-touch-icon.png", "wb") as f:
        f.write(png_180)

    print("Generating favicon-32.png...")
    png_32 = generate_piano_icon(32)
    with open("public/favicon-32.png", "wb") as f:
        f.write(png_32)

    print("All PWA icons generated successfully! 🎉")
