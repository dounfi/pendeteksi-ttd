"""
contrast-check.py
Calculates WCAG 2.1 contrast ratios for every text and background pair across all sections.
WCAG AA requirements: >= 4.5:1 for normal text, >= 3.0:1 for large text.
WCAG AAA requirements: >= 7.0:1 for normal text, >= 4.5:1 for large text.
"""

def parse_hex(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def linearize(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(r, g, b):
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

def contrast_ratio(hex1, hex2):
    lum1 = luminance(*parse_hex(hex1))
    lum2 = luminance(*parse_hex(hex2))
    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)

sections = [
    ("1 Hero H1", "#2B58B5", "#FFFFFF", "White on Mat Blue"),
    ("1 Hero Sub", "#2B58B5", "#FFFEFA", "Paper-white on Mat Blue"),
    ("2 Masalah", "#FFE27A", "#14213D", "Ink on Legal-pad Yellow"),
    ("3 Empat Hal", "#F7F2E6", "#14213D", "Ink on Cream"),
    ("4 Tiga Langkah", "#14346B", "#FFFFFF", "White on Deep Navy"),
    ("4 Tiga Langkah Sub", "#14346B", "#FFFEFA", "Paper-white on Deep Navy"),
    ("5 Pengolahan Citra", "#E2C07C", "#14213D", "Ink on Manila"),
    ("6 Siamese", "#1F4FBF", "#FFFFFF", "White on Label Blue"),
    ("7 Hasil", "#F7F2E6", "#14213D", "Ink on Cream"),
    ("8 Foto HP", "#14346B", "#FFFFFF", "White on Deep Navy"),
    ("9 Batasan", "#E2C07C", "#14213D", "Ink on Manila"),
    ("10 Kuis", "#BFE3F5", "#14213D", "Ink on Sticky Blue"),
    ("11 Ajakan Akhir", "#2B58B5", "#FFFFFF", "White on Mat Blue"),
    ("11 Yellow Button", "#FFE27A", "#14213D", "Ink on Yellow Button"),
    ("12 Footer", "#C9A55E", "#14213D", "Ink on Manila Dark"),
    ("Highlighter Swash", "#FFE27A", "#14213D", "Ink on Yellow Swash"),
]

print("=== WCAG 2.1 CONTRAST CHECK REPORT ===")
all_pass = True
for name, bg, fg, desc in sections:
    cr = contrast_ratio(bg, fg)
    status = "PASS (AAA)" if cr >= 7.0 else ("PASS (AA)" if cr >= 4.5 else "FAIL")
    if cr < 4.5:
        all_pass = False
    print(f"{name:20} | {bg} vs {fg} | CR: {cr:5.2f}:1 | {status:10} | {desc}")

print("=======================================")
if all_pass:
    print("ALL TEXT AND BACKGROUND PAIRS PASS WCAG AA / AAA.")
else:
    print("SOME PAIRS FAILED. ADJUST COLORS!")
