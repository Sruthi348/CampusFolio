import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Circle, Polygon, Rectangle
import os

# Create figure with high DPI
fig, ax = plt.subplots(figsize=(16, 12), dpi=300)
ax.set_xlim(0, 160)
ax.set_ylim(0, 120)
ax.axis('off')

# Background
bg_color = "#FFFFFF"
fig.patch.set_facecolor(bg_color)
ax.set_facecolor(bg_color)

# Palette
lane_header_bg = "#1E1B4B" # Indigo Dark
lane_header_text = "#FFFFFF"
lane_border = "#CBD5E1"
task_border = "#3730A3"
task_bg = "#EEF2FF"
gateway_border = "#D97706" # Amber
gateway_bg = "#FEF3C7"
event_start_border = "#059669" # Emerald
event_start_bg = "#D1FAE5"
event_end_border = "#DC2626" # Red
event_end_bg = "#FEE2E2"
line_color = "#475569"
text_dark = "#0F172A"
text_muted = "#64748B"

# ================= 4 SWIMLANES =================
lanes = [
    {"name": "Public Visitor", "y_top": 115, "height": 26, "bg": "#F8FAFC"},
    {"name": "Student", "y_top": 89, "height": 30, "bg": "#FFFFFF"},
    {"name": "Administrator", "y_top": 59, "height": 27, "bg": "#F8FAFC"},
    {"name": "System & Database", "y_top": 32, "height": 28, "bg": "#FFFFFF"}
]

# Title banner
ax.text(80, 117.5, "BPMN 2.0 Collaboration Process Diagram — Student Portfolio Platform",
        ha='center', va='center', fontsize=14, fontweight='bold', color=text_dark)

for l in lanes:
    y_b = l["y_top"] - l["height"]
    # Lane body
    rect = Rectangle((18, y_b), 140, l["height"], facecolor=l["bg"], edgecolor=lane_border, lw=1.2, zorder=1)
    ax.add_patch(rect)
    # Lane header
    header = Rectangle((4, y_b), 14, l["height"], facecolor=lane_header_bg, edgecolor=lane_border, lw=1.2, zorder=2)
    ax.add_patch(header)
    # Header vertical text
    ax.text(11, y_b + l["height"]/2, l["name"], ha='center', va='center',
            fontsize=10, fontweight='bold', color=lane_header_text, rotation=90, zorder=3)

# Helper draw functions
def draw_task(x, y, w, h, text1, text2=None, is_service=False):
    patch = FancyBboxPatch((x - w/2, y - h/2), w, h,
                           boxstyle="round,pad=0.2,rounding_size=1.0",
                           facecolor="#F0FDF4" if is_service else task_bg,
                           edgecolor="#0D9488" if is_service else task_border,
                           linewidth=1.4, zorder=4)
    ax.add_patch(patch)
    # Badge indicator (Service vs User task)
    badge = "[Service]" if is_service else "[User]"
    badge_col = "#0D9488" if is_service else "#3730A3"
    ax.text(x - w/2 + 3.2, y + h/2 - 1.4, badge, fontsize=6.5, fontweight='bold', color=badge_col, zorder=5)
        
    if text2:
        ax.text(x, y + 0.8, text1, ha='center', va='center', fontsize=8, fontweight='bold', color=text_dark, zorder=5)
        ax.text(x, y - 1.3, text2, ha='center', va='center', fontsize=7.2, color=text_muted, zorder=5)
    else:
        ax.text(x, y, text1, ha='center', va='center', fontsize=8, fontweight='bold', color=text_dark, zorder=5)

def draw_gateway(x, y, size=7.0, symbol="X"):
    pts = [[x, y + size/2], [x + size/2, y], [x, y - size/2], [x - size/2, y]]
    poly = Polygon(pts, closed=True, facecolor=gateway_bg, edgecolor=gateway_border, linewidth=1.4, zorder=4)
    ax.add_patch(poly)
    ax.text(x, y, symbol, ha='center', va='center', fontsize=11, fontweight='bold', color="#92400E", zorder=5)

def draw_start_event(x, y, r=2.6, label="Start"):
    c = Circle((x, y), r, facecolor=event_start_bg, edgecolor=event_start_border, linewidth=1.5, zorder=4)
    ax.add_patch(c)
    ax.text(x, y - 4.2, label, ha='center', va='center', fontsize=7.5, fontweight='bold', color="#065F46", zorder=5)

def draw_end_event(x, y, r=2.6, label="End"):
    c = Circle((x, y), r, facecolor=event_end_bg, edgecolor=event_end_border, linewidth=2.8, zorder=4)
    ax.add_patch(c)
    ax.text(x, y - 4.2, label, ha='center', va='center', fontsize=7.5, fontweight='bold', color="#991B1B", zorder=5)

def draw_seq_flow(x1, y1, x2, y2, label=None, label_pos="above"):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=line_color, lw=1.3, shrinkA=0, shrinkB=0, mutation_scale=10),
                zorder=3)
    if label:
        xm, ym = (x1 + x2)/2, (y1 + y2)/2
        offset = 1.6 if label_pos == "above" else -1.6
        ax.text(xm, ym + offset, label, ha='center', va='center', fontsize=7.5, fontweight='bold', color="#334155", zorder=6)

def draw_msg_flow(x1, y1, x2, y2, label=None):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color="#94A3B8", lw=1.2, linestyle="--", shrinkA=0, shrinkB=0, mutation_scale=10),
                zorder=3)
    c = Circle((x1, y1), 0.7, facecolor="#FFFFFF", edgecolor="#94A3B8", lw=1.0, zorder=4)
    ax.add_patch(c)
    if label:
        xm, ym = (x1 + x2)/2, (y1 + y2)/2
        ax.text(xm + 1.5, ym, label, ha='left', va='center', fontsize=6.8, color="#64748B", zorder=6, style='italic')

def draw_line(x1, y1, x2, y2, dashed=False):
    ax.plot([x1, x2], [y1, y2], color="#94A3B8" if dashed else line_color,
            lw=1.2, linestyle="--" if dashed else "-", zorder=3)


# =========================================================================
# 1. PUBLIC VISITOR LANE (y in [89, 115], center ~ 102)
# =========================================================================
draw_start_event(25, 102, label="Visitor Lands")
draw_seq_flow(27.6, 102, 35, 102)

draw_task(44, 102, 18, 7.5, "Search & Filter", "Skills, Dept, Batch")
draw_seq_flow(53, 102, 60, 102)

# Message down to system
draw_msg_flow(44, 98.2, 44, 22.5, label="Filter Query")

draw_task(69, 102, 18, 7.5, "Select Student Card", "from Search Grid")
draw_seq_flow(78, 102, 85, 102)

draw_task(94, 102, 18, 7.5, "View Public Portfolio", "/student/:slug")
draw_seq_flow(103, 102, 110, 102)

draw_task(119, 102, 18, 7.5, "Inspect Verified Work", "Certs & Projects")
draw_seq_flow(128, 102, 137, 102)

draw_end_event(140, 102, label="Portfolio Explored")


# =========================================================================
# 2. STUDENT LANE (y in [59, 89], center ~ 74)
# =========================================================================
draw_start_event(25, 74, label="Student Logs In")
draw_seq_flow(27.6, 74, 34, 74)

draw_task(42, 74, 16, 7.5, "Enter Credentials", "Email & Password")
draw_seq_flow(50, 74, 56.5, 74)

draw_gateway(60, 74, size=7.0, symbol="X")
# Failed auth loop
draw_line(60, 77.5, 60, 83)
draw_line(60, 83, 42, 83)
draw_seq_flow(42, 83, 42, 77.8, label="Invalid (401)")

# Valid Auth
draw_seq_flow(63.5, 74, 71, 74, label="Valid", label_pos="above")

draw_task(79, 74, 16, 7.5, "Open Dashboard", "View 100% Checklist")
draw_seq_flow(87, 74, 92.5, 74)

# Multi-path Parallel / XOR Gateway
draw_gateway(96, 74, size=7.0, symbol="+")

# Branch A: Add Project (Up)
draw_line(96, 77.5, 96, 82)
draw_seq_flow(96, 82, 104, 82)
draw_task(113, 82, 18, 7.0, "Add Project & Code", "Screenshots, GitHub URL")
draw_msg_flow(113, 78.5, 113, 22.5, label="Save Project")
draw_seq_flow(122, 82, 130, 82)
draw_task(138, 82, 16, 7.0, "Project Published", "Instant Public Sync")
draw_seq_flow(146, 82, 150.4, 82)
draw_end_event(153, 82, label="Published")

# Branch B: Upload Certificate (Down)
draw_line(96, 70.5, 96, 66)
draw_seq_flow(96, 66, 104, 66)
draw_task(113, 66, 18, 7.0, "Upload Cert (PDF)", "Proof & Credential URL")
draw_msg_flow(113, 62.5, 113, 22.5, label="Queue Cert")
draw_seq_flow(122, 66, 129, 66)
draw_task(137, 66, 16, 7.0, "Status: PENDING", "Awaiting Admin Review")
draw_seq_flow(145, 66, 149.4, 66)
draw_end_event(152, 66, label="Queued")


# =========================================================================
# 3. ADMINISTRATOR LANE (y in [32, 59], center ~ 45.5)
# =========================================================================
draw_start_event(25, 45.5, label="Admin Login")
draw_seq_flow(27.6, 45.5, 35, 45.5)

draw_task(44, 45.5, 18, 7.5, "Access Control Panel", "Dean / HOD Role")
draw_seq_flow(53, 45.5, 60, 45.5)

draw_task(69, 45.5, 18, 7.5, "Open Moderation Queue", "2 Pending Certs")
draw_seq_flow(78, 45.5, 85, 45.5)

draw_task(94, 45.5, 18, 7.5, "Audit PDF & Credentials", "Verify Issuing Body")
draw_seq_flow(103, 45.5, 109.5, 45.5)

# Verification Decision Gateway
draw_gateway(113, 45.5, size=7.0, symbol="X")

# Decision 1: Verify & Approve (Up branch)
draw_line(113, 49, 113, 53)
draw_seq_flow(113, 53, 120, 53)
draw_task(129, 53, 18, 6.8, "Approve Credential", "Status = VERIFIED")
draw_msg_flow(129, 49.6, 129, 22.5, label="Commit Audit")
draw_seq_flow(138, 53, 144.4, 53)
draw_end_event(147, 53, label="Verified")

# Decision 2: Reject with Note (Down branch)
draw_line(113, 42, 113, 38)
draw_seq_flow(113, 38, 120, 38)
draw_task(129, 38, 18, 6.8, "Reject with Notes", "Feedback to Student")
draw_msg_flow(129, 34.6, 129, 22.5, label="Log Rejection")
draw_seq_flow(138, 38, 144.4, 38)
draw_end_event(147, 38, label="Rejected")


# =========================================================================
# 4. SYSTEM & DATABASE LANE (y in [4, 32], center ~ 18)
# =========================================================================
draw_task(44, 18, 20, 8.0, "Execute SQL Query", "prisma.studentProfile", is_service=True)
draw_msg_flow(44, 22, 69, 98.2, label="Approved Rows")

draw_task(79, 18, 20, 8.0, "JWT Auth Engine", "Bcrypt Verify & RBAC", is_service=True)
draw_msg_flow(79, 22, 79, 70.2, label="Bearer Token")

draw_task(113, 18, 20, 8.0, "Prisma Engine", "PostgreSQL Commit", is_service=True)

draw_task(136, 18, 20, 8.0, "AuditLog Generator", "Admin ID, Action, Time", is_service=True)


# Save diagram
output_png = r"C:\Users\sruth\.gemini\antigravity\brain\d6778eea-ebd2-4bdc-bdce-aeed47c7e45a\bpmn_diagram.png"
output_jpg = r"C:\Users\sruth\.gemini\antigravity\brain\d6778eea-ebd2-4bdc-bdce-aeed47c7e45a\bpmn_diagram.jpg"
output_workspace_png = r"d:\MCA-SEMESTER-1-WAD\bpmn_diagram.png"

plt.tight_layout()
plt.savefig(output_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(output_jpg, format='jpeg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(output_workspace_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
print("Successfully generated clean BPMN 2.0 diagram!")
