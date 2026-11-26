import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon
import matplotlib.patheffects as patheffects

# Setup figure with clean high-res canvas
fig, ax = plt.subplots(figsize=(11, 15), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 135)
ax.axis('off')

# Styling constants matching the reference image
bg_color = "#F8FAFC"
fig.patch.set_facecolor(bg_color)
ax.set_facecolor(bg_color)

box_edge = "#CBD5E1"
line_color = "#64748B"
text_dark = "#0F172A"
text_muted = "#475569"
text_label = "#64748B"

def draw_rect(x, y, w, h, text, subtext=None, rx=0.8):
    # Centered at (x, y)
    patch = FancyBboxPatch((x - w/2, y - h/2), w, h,
                           boxstyle=f"round,pad=0.2,rounding_size={rx}",
                           facecolor="#FFFFFF", edgecolor=box_edge, linewidth=1.5,
                           zorder=3)
    ax.add_patch(patch)
    if subtext:
        ax.text(x, y + 0.9, text, ha='center', va='center', fontsize=9.5, fontweight='bold', color=text_dark, zorder=4)
        ax.text(x, y - 1.1, subtext, ha='center', va='center', fontsize=7.5, fontweight='normal', color=text_muted, zorder=4)
    else:
        ax.text(x, y, text, ha='center', va='center', fontsize=9.5, fontweight='bold', color=text_dark, zorder=4)

def draw_pill(x, y, w, h, text):
    patch = FancyBboxPatch((x - w/2, y - h/2), w, h,
                           boxstyle="round,pad=0.3,rounding_size=2.0",
                           facecolor="#FFFFFF", edgecolor=box_edge, linewidth=1.5,
                           zorder=3)
    ax.add_patch(patch)
    ax.text(x, y, text, ha='center', va='center', fontsize=10, fontweight='bold', color=text_dark, zorder=4)

def draw_diamond(x, y, w, h, line1, line2=None):
    pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
    poly = Polygon(pts, closed=True, facecolor="#FFFFFF", edgecolor=box_edge, linewidth=1.5, zorder=3)
    ax.add_patch(poly)
    if line2:
        ax.text(x, y + 0.8, line1, ha='center', va='center', fontsize=9, fontweight='bold', color=text_dark, zorder=4)
        ax.text(x, y - 1.0, line2, ha='center', va='center', fontsize=9, fontweight='bold', color=text_dark, zorder=4)
    else:
        ax.text(x, y, line1, ha='center', va='center', fontsize=9.5, fontweight='bold', color=text_dark, zorder=4)

def draw_arrow(x1, y1, x2, y2):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=line_color, lw=1.5, shrinkA=0, shrinkB=0, mutation_scale=12),
                zorder=2)

def draw_line(x1, y1, x2, y2):
    ax.plot([x1, x2], [y1, y2], color=line_color, lw=1.5, zorder=2)

# ================= TOP FLOW =================
# Start
draw_pill(50, 128, 14, 4.5, "Start")
draw_arrow(50, 125.5, 50, 121)

# User Opens App
draw_rect(50, 118, 20, 5.5, "User Opens App")
draw_arrow(50, 115, 50, 110.5)

# Authentication Diamond
draw_diamond(50, 105, 20, 10.5, "Authentication", "Successful?")

# Auth -> No (Left)
draw_line(40, 105, 20, 105)
draw_arrow(20, 105, 20, 96.5)
ax.text(28, 106.5, "No", fontsize=8.5, color=text_label, fontweight='semibold')

# Show Error Message
draw_rect(20, 93.5, 22, 5.5, "Show Error Message")
draw_arrow(20, 90.5, 20, 85)

# Retry Login
draw_rect(20, 82, 18, 5.5, "Retry Login")
# Loop back from Retry Login to Auth Diamond
draw_line(20, 79, 36, 79)
draw_line(36, 79, 36, 105)
draw_arrow(36, 105, 39.5, 105)

# Auth -> Yes (Down to Home Screen)
draw_arrow(50, 99.5, 50, 92)
ax.text(51.5, 96.5, "Yes", fontsize=8.5, color=text_label, fontweight='semibold')

# Home Screen
draw_rect(50, 88.5, 20, 6.0, "Home Screen")
draw_arrow(50, 85.3, 50, 79)

# User Action Diamond
draw_diamond(50, 73.5, 20, 10.5, "User Action")

# ================= 3 COLUMNS BRANCHING =================
# Left Branch (Browse) -> Col 1 at x = 18
draw_line(40, 73.5, 18, 73.5)
draw_arrow(18, 73.5, 18, 64)
ax.text(26, 74.8, "Browse", fontsize=8.5, color=text_label, fontweight='semibold')

# Middle Branch (Post) -> Col 2 at x = 50
draw_arrow(50, 68, 50, 64)
ax.text(51.5, 66, "Post", fontsize=8.5, color=text_label, fontweight='semibold')

# Right Branch (Profile) -> Col 3 at x = 82
draw_line(60, 73.5, 82, 73.5)
draw_arrow(82, 73.5, 82, 64)
ax.text(70, 74.8, "Profile", fontsize=8.5, color=text_label, fontweight='semibold')


# ---------------- COLUMN 1: BROWSE ----------------
# Browse Listings
draw_rect(18, 60.5, 20, 5.8, "Browse Listings")
draw_arrow(18, 57.4, 18, 51.5)

# View Item Details
draw_rect(18, 48, 20, 5.8, "View Item Details")
draw_arrow(18, 44.9, 18, 38.5)

# Contact Seller / Recruiter
draw_rect(18, 35, 22, 6.2, "Contact Candidate", "Email / LinkedIn")
draw_arrow(18, 31.7, 18, 24)

# End 1
draw_pill(18, 21.5, 13, 4.5, "End")


# ---------------- COLUMN 2: POST ----------------
# Post Item
draw_rect(50, 60.5, 20, 5.8, "Post Item / Project")
draw_arrow(50, 57.4, 50, 53)

# Enter Item Details
patch_details = FancyBboxPatch((50 - 12.5, 43 - 8.5/2), 25, 8.5,
                               boxstyle="round,pad=0.2,rounding_size=0.8",
                               facecolor="#FFFFFF", edgecolor=box_edge, linewidth=1.5, zorder=3)
ax.add_patch(patch_details)
ax.text(50, 45.2, "Enter Project Details", ha='center', va='center', fontsize=9.2, fontweight='bold', color=text_dark, zorder=4)
ax.text(50, 43.1, "Title, Description,", ha='center', va='center', fontsize=7.6, color=text_muted, zorder=4)
ax.text(50, 41.3, "Category, Tech Stack, Images", ha='center', va='center', fontsize=7.6, color=text_muted, zorder=4)
draw_arrow(50, 38.5, 50, 33.5)

# Submit Listing
draw_rect(50, 30.5, 20, 5.5, "Submit Listing")
draw_arrow(50, 27.5, 50, 22.5)

# Listing Published
draw_rect(50, 19.5, 20, 5.5, "Listing Published")
draw_arrow(50, 16.5, 50, 11)

# End 2
draw_pill(50, 8.5, 13, 4.5, "End")


# ---------------- COLUMN 3: PROFILE ----------------
# View Profile
draw_rect(82, 60.5, 20, 5.8, "View Profile")
draw_arrow(82, 57.4, 82, 51.5)

# View My Listings
draw_rect(82, 48, 20, 5.8, "View My Listings")
draw_arrow(82, 44.9, 82, 40)

# Action Diamond (Sub-Action)
draw_diamond(82, 35, 16, 9.0, "Action")

# Sub-Action 1: Edit (Left branch of Col 3) -> x = 69
draw_line(74, 35, 69, 35)
draw_arrow(69, 35, 69, 27.5)
ax.text(68, 32, "Edit", fontsize=8, color=text_label, fontweight='semibold', ha='right')
draw_rect(69, 24.5, 13, 5.2, "Edit Listing")

# Sub-Action 2: Delete (Center branch of Col 3) -> x = 82
draw_arrow(82, 30.3, 82, 27.5)
ax.text(83.2, 29, "Delete", fontsize=8, color=text_label, fontweight='semibold')
draw_rect(82, 24.5, 13, 5.2, "Delete Listing")

# Sub-Action 3: Mark Sold / Cert (Right branch of Col 3) -> x = 94
draw_line(90, 35, 94, 35)
draw_arrow(94, 35, 94, 27.5)
ax.text(95.5, 32, "Mark Sold", fontsize=7.5, color=text_label, fontweight='semibold', ha='left')
draw_rect(94, 24.5, 12, 5.2, "Mark Sold")

# Clear merge lines leading cleanly to End 3 without overlapping!
# From Edit Listing (x=69, y=21.8) -> down to 14.5, right to 82
draw_line(69, 21.8, 69, 14.5)
draw_line(69, 14.5, 82, 14.5)

# From Mark Sold (x=94, y=21.8) -> down to 14.5, left to 82
draw_line(94, 21.8, 94, 14.5)
draw_line(94, 14.5, 82, 14.5)

# From Delete Listing (x=82, y=21.8) -> down to 14.5
draw_line(82, 21.8, 82, 14.5)

# Single clean downward arrow to End 3
draw_arrow(82, 14.5, 82, 11)

# End 3
draw_pill(82, 8.5, 13, 4.5, "End")

# Output paths
output_png = r"C:\Users\sruth\.gemini\antigravity\brain\d6778eea-ebd2-4bdc-bdce-aeed47c7e45a\application_flow_diagram.png"
output_jpg = r"C:\Users\sruth\.gemini\antigravity\brain\d6778eea-ebd2-4bdc-bdce-aeed47c7e45a\application_flow_diagram.jpg"
output_workspace_png = r"d:\MCA-SEMESTER-1-WAD\application_flow_diagram.png"

plt.tight_layout()
plt.savefig(output_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(output_jpg, format='jpeg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(output_workspace_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
print("Successfully generated clean diagram images!")
