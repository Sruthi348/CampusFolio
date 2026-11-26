import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle
import os

fig, ax = plt.subplots(figsize=(16, 12), dpi=300)
ax.set_xlim(0, 160)
ax.set_ylim(0, 120)
ax.axis('off')

fig.patch.set_facecolor('#F8FAFC')
ax.set_facecolor('#F8FAFC')

# Wireframe palette
wf_dark = "#1E293B"      # slate-800
wf_gray = "#64748B"      # slate-500
wf_light = "#F1F5F9"     # slate-100
wf_border = "#94A3B8"    # slate-400
wf_box_bg = "#FFFFFF"
accent_indigo = "#3730A3"
accent_teal = "#0D9488"
accent_amber = "#F59E0B"

# Title
ax.text(80, 116.5, "UI / UX WIREFRAME PROTOTYPES — PROPOSED APPLICATION",
        ha='center', va='center', fontsize=14, fontweight='bold', color=wf_dark)
ax.text(80, 114, "Standard Low-to-Mid Fidelity Wireframe Schematics for Core Application Views",
        ha='center', va='center', fontsize=9, color=wf_gray)

def draw_device_frame(x, y, w, h, title):
    # Outer device card
    card = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2,rounding_size=1.0",
                          facecolor=wf_box_bg, edgecolor=wf_border, lw=1.5, zorder=2)
    ax.add_patch(card)
    # Browser chrome bar
    top_bar = Rectangle((x, y + h - 3.5), w, 3.5, facecolor="#E2E8F0", edgecolor=wf_border, lw=1.0, zorder=3)
    ax.add_patch(top_bar)
    # Window dots
    ax.add_patch(Circle((x + 2, y + h - 1.75), 0.6, facecolor="#EF4444", zorder=4))
    ax.add_patch(Circle((x + 3.8, y + h - 1.75), 0.6, facecolor="#F59E0B", zorder=4))
    ax.add_patch(Circle((x + 5.6, y + h - 1.75), 0.6, facecolor="#10B981", zorder=4))
    # Title
    ax.text(x + w/2, y + h - 1.75, title, ha='center', va='center', fontsize=7.5, fontweight='bold', color=wf_dark, zorder=4)

def draw_image_placeholder(x, y, w, h, label="[IMAGE]"):
    box = Rectangle((x, y), w, h, facecolor="#E2E8F0", edgecolor="#CBD5E1", lw=1.0, zorder=3)
    ax.add_patch(box)
    ax.plot([x, x+w], [y, y+h], color="#CBD5E1", lw=0.8, zorder=4)
    ax.plot([x, x+w], [y+h, y], color="#CBD5E1", lw=0.8, zorder=4)
    if label:
        ax.text(x + w/2, y + h/2, label, ha='center', va='center', fontsize=6.5, color=wf_gray, zorder=5)

# =========================================================================
# 1. TOP-LEFT: WIREFRAME 1 — PUBLIC DISCOVERY & HOME
# =========================================================================
x1, y1, w1, h1 = 6, 60, 71, 51
draw_device_frame(x1, y1, w1, h1, "View 1: Public Home & Talent Search (/)")

# Navbar
ax.add_patch(Rectangle((x1, y1 + h1 - 7), w1, 3.5, facecolor="#FFFFFF", edgecolor="#E2E8F0", lw=1, zorder=3))
ax.text(x1 + 3, y1 + h1 - 5.2, "[LOGO] University Portal", fontsize=7, fontweight='bold', color=accent_indigo, zorder=4)
ax.text(x1 + 25, y1 + h1 - 5.2, "Explore   Departments   Featured   About", fontsize=6, color=wf_gray, zorder=4)
ax.add_patch(FancyBboxPatch((x1 + w1 - 18, y1 + h1 - 6.2), 8, 2.2, boxstyle="round,pad=0.1", facecolor="#EEF2FF", edgecolor=accent_indigo, lw=0.8, zorder=4))
ax.text(x1 + w1 - 14, y1 + h1 - 5.1, "Student Login", fontsize=5.5, ha='center', va='center', color=accent_indigo, fontweight='bold', zorder=5)
ax.add_patch(FancyBboxPatch((x1 + w1 - 9, y1 + h1 - 6.2), 7.5, 2.2, boxstyle="round,pad=0.1", facecolor=accent_indigo, edgecolor=accent_indigo, lw=0.8, zorder=4))
ax.text(x1 + w1 - 5.25, y1 + h1 - 5.1, "Admin", fontsize=5.5, ha='center', va='center', color="#FFF", fontweight='bold', zorder=5)

# Hero Section
ax.text(x1 + w1/2, y1 + h1 - 10, "Discover Verified Student Talent & Innovation", ha='center', fontsize=9.5, fontweight='bold', color=wf_dark, zorder=4)
ax.text(x1 + w1/2, y1 + h1 - 12, "Search dynamic student portfolios, audited credentials, and open-source repositories.", ha='center', fontsize=6.5, color=wf_gray, zorder=4)

# Global Search Bar
ax.add_patch(FancyBboxPatch((x1 + 10, y1 + h1 - 17.5), w1 - 20, 3.8, boxstyle="round,pad=0.2,rounding_size=0.6", facecolor="#FFF", edgecolor="#3730A3", lw=1.2, zorder=4))
ax.text(x1 + 13, y1 + h1 - 15.6, "🔍 Search by student name, skill (e.g. React, PostgreSQL), department...", fontsize=6, color="#94A3B8", zorder=5)
ax.add_patch(FancyBboxPatch((x1 + w1 - 23, y1 + h1 - 17), 11, 2.8, boxstyle="round,pad=0.1", facecolor=accent_indigo, edgecolor=accent_indigo, zorder=5))
ax.text(x1 + w1 - 17.5, y1 + h1 - 15.6, "Search", fontsize=6, ha='center', va='center', color="#FFF", fontweight='bold', zorder=6)

# Quick Filter Pills
ax.text(x1 + 12, y1 + h1 - 20, "Tags: [ #React ]  [ #Node.js ]  [ #PostgreSQL ]  [ #Docker ]  [ #Python ]", fontsize=6, color=accent_teal, zorder=4)

# Section Title
ax.text(x1 + 4, y1 + h1 - 23.5, "Featured Student Portfolios", fontsize=7.5, fontweight='bold', color=wf_dark, zorder=4)

# 3 Student Cards Grid
card_w = 20.5
for i, name, dept, status, color in [
    (0, "Keerthana A R", "MCA 2026", "Active", "#10B981"),
    (1, "Rahul Sharma", "CSE 2026", "Active", "#10B981"),
    (2, "Ananya Patel", "IT 2024", "Alumni", "#F59E0B")
]:
    cx = x1 + 4 + i * (card_w + 2.5)
    cy = y1 + 3.5
    ax.add_patch(FancyBboxPatch((cx, cy), card_w, 21.5, boxstyle="round,pad=0.2", facecolor="#FFF", edgecolor="#CBD5E1", lw=0.9, zorder=3))
    # Avatar
    ax.add_patch(Circle((cx + 3, cy + 18), 2.0, facecolor=accent_indigo, zorder=4))
    ax.text(cx + 3, cy + 18, name[0], color="#FFF", fontsize=7, fontweight='bold', ha='center', va='center', zorder=5)
    # Name & Dept
    ax.text(cx + 6.5, cy + 19, name, fontsize=6.8, fontweight='bold', color=wf_dark, zorder=4)
    ax.text(cx + 6.5, cy + 17, dept, fontsize=5.8, color=wf_gray, zorder=4)
    # Status Pill
    ax.add_patch(FancyBboxPatch((cx + card_w - 5.5, cy + 18), 4.5, 1.8, boxstyle="round,pad=0.1", facecolor="#F1F5F9", edgecolor=color, lw=0.6, zorder=4))
    ax.text(cx + card_w - 3.25, cy + 18.9, status, fontsize=5, ha='center', color=color, fontweight='bold', zorder=5)
    # Bio
    ax.text(cx + 1.5, cy + 13.5, "Fullstack engineer building distributed", fontsize=5.5, color=wf_dark, zorder=4)
    ax.text(cx + 1.5, cy + 11.8, "systems & cloud PostgreSQL pipelines.", fontsize=5.5, color=wf_dark, zorder=4)
    # Skill chips
    ax.add_patch(FancyBboxPatch((cx + 1.5, cy + 7.5), 5.5, 1.8, boxstyle="round,pad=0.1", facecolor="#F0FDFA", edgecolor=accent_teal, lw=0.6, zorder=4))
    ax.text(cx + 4.25, cy + 8.4, "React", fontsize=5, ha='center', color=accent_teal, zorder=5)
    ax.add_patch(FancyBboxPatch((cx + 7.5, cy + 7.5), 5.5, 1.8, boxstyle="round,pad=0.1", facecolor="#F0FDFA", edgecolor=accent_teal, lw=0.6, zorder=4))
    ax.text(cx + 10.25, cy + 8.4, "Node.js", fontsize=5, ha='center', color=accent_teal, zorder=5)
    ax.add_patch(FancyBboxPatch((cx + 13.5, cy + 7.5), 5.5, 1.8, boxstyle="round,pad=0.1", facecolor="#F0FDFA", edgecolor=accent_teal, lw=0.6, zorder=4))
    ax.text(cx + 16.25, cy + 8.4, "SQL", fontsize=5, ha='center', color=accent_teal, zorder=5)
    # Card Footer
    ax.add_patch(Rectangle((cx, cy + 4.2), card_w, 0.4, facecolor="#E2E8F0", zorder=4))
    ax.text(cx + 1.5, cy + 2.2, "2 Projects • 2 Certs", fontsize=5.2, color=wf_gray, zorder=4)
    ax.text(cx + card_w - 1.5, cy + 2.2, "View →", fontsize=5.5, fontweight='bold', ha='right', color=accent_indigo, zorder=4)


# =========================================================================
# 2. TOP-RIGHT: WIREFRAME 2 — PUBLIC STUDENT PORTFOLIO (/student/:slug)
# =========================================================================
x2, y2, w2, h2 = 83, 60, 71, 51
draw_device_frame(x2, y2, w2, h2, "View 2: Public Student Portfolio (/student/:slug)")

# Top Share Bar
ax.add_patch(Rectangle((x2 + 3, y2 + h2 - 7.5), w2 - 6, 3.2, facecolor="#F8FAFC", edgecolor="#E2E8F0", lw=0.8, zorder=3))
ax.text(x2 + 5, y2 + h2 - 5.8, "← Back to Discovery", fontsize=5.5, color=accent_indigo, fontweight='bold', zorder=4)
ax.text(x2 + w2 - 5, y2 + h2 - 5.8, "URL: /student/keerthana-ar  [ Copy Link ]", fontsize=5.5, ha='right', color=wf_gray, zorder=4)

# Profile Header Banner Box
ax.add_patch(FancyBboxPatch((x2 + 3, y2 + h2 - 20), w2 - 6, 11.5, boxstyle="round,pad=0.2", facecolor="#FFF", edgecolor="#CBD5E1", lw=1.0, zorder=3))
draw_image_placeholder(x2 + 5.5, y2 + h2 - 18.5, 8.5, 8.5, label="PHOTO")
ax.text(x2 + 16, y2 + h2 - 12.5, "Keerthana A R", fontsize=9.5, fontweight='bold', color=wf_dark, zorder=4)
ax.add_patch(FancyBboxPatch((x2 + 36, y2 + h2 - 13.5), 9, 2.0, boxstyle="round,pad=0.1", facecolor="#ECFDF5", edgecolor="#10B981", lw=0.6, zorder=4))
ax.text(x2 + 40.5, y2 + h2 - 12.5, "✓ Verified Student", fontsize=5.5, ha='center', color="#065F46", fontweight='bold', zorder=5)
ax.text(x2 + 16, y2 + h2 - 15, "Dept. of Computer Applications (MCA) • Batch 2026 • Roll #MCA202401", fontsize=5.8, color=wf_gray, zorder=4)
ax.text(x2 + 16, y2 + h2 - 17, "Fullstack engineer specializing in cloud architecture, PostgreSQL pipelines, and responsive React.", fontsize=5.5, color=wf_dark, zorder=4)

# Social Links (Right of Header)
ax.text(x2 + w2 - 6, y2 + h2 - 12.5, "[GitHub]  [LinkedIn]  [Portfolio]", fontsize=5.8, ha='right', color=accent_indigo, zorder=4)

# Skills Block
ax.add_patch(FancyBboxPatch((x2 + 3, y2 + h2 - 27.5), w2 - 6, 6.5, boxstyle="round,pad=0.2", facecolor="#FFF", edgecolor="#CBD5E1", lw=0.8, zorder=3))
ax.text(x2 + 5.5, y2 + h2 - 23, "SKILLS & COMPETENCIES", fontsize=6, fontweight='bold', color=accent_indigo, zorder=4)
ax.text(x2 + 5.5, y2 + h2 - 25.5, "[React - Adv]  [Node.js - Adv]  [PostgreSQL - Adv]  [Docker - Adv]  [Cloud Arch - Int]  [Tailwind]", fontsize=5.5, color=accent_teal, zorder=4)

# Projects Showcase Grid (2 cards)
ax.text(x2 + 4, y2 + h2 - 29.5, "VERIFIED ENGINEERING PROJECTS", fontsize=6.5, fontweight='bold', color=wf_dark, zorder=4)
for j, ptitle in [(0, "CampusHub - Navigation Portal"), (1, "FinFlow - Distributed Ledger")]:
    px = x2 + 3 + j * 33
    py = y2 + 10.5
    ax.add_patch(FancyBboxPatch((px, py), 31.5, 9.5, boxstyle="round,pad=0.2", facecolor="#F8FAFC", edgecolor="#CBD5E1", lw=0.8, zorder=3))
    ax.text(px + 2, py + 7.5, ptitle, fontsize=6.8, fontweight='bold', color=wf_dark, zorder=4)
    ax.text(px + 2, py + 5.5, "Production fullstack app with Redis cache & PostgreSQL.", fontsize=5.2, color=wf_gray, zorder=4)
    ax.text(px + 2, py + 3.5, "Tech: React • Express • PostgreSQL", fontsize=5.0, color=accent_teal, zorder=4)
    ax.text(px + 2, py + 1.5, "Repo: github.com/keerthana-ar/app", fontsize=5.0, color=accent_indigo, zorder=4)
    ax.text(px + 30, py + 1.5, "[Live Demo ↗]", fontsize=5.0, ha='right', color=accent_indigo, zorder=4)

# Verified Credentials Timeline
ax.add_patch(FancyBboxPatch((x2 + 3, y2 + 2), w2 - 6, 7.5, boxstyle="round,pad=0.2", facecolor="#FFF", edgecolor="#CBD5E1", lw=0.8, zorder=3))
ax.text(x2 + 5.5, y2 + 7.5, "INSTITUTIONALLY VERIFIED CERTIFICATIONS", fontsize=6, fontweight='bold', color=accent_indigo, zorder=4)
ax.text(x2 + 5.5, y2 + 5.2, "✓ AWS Certified Solutions Architect (Amazon Web Services) — Verified by Administration", fontsize=5.5, color="#065F46", zorder=4)
ax.text(x2 + 5.5, y2 + 3.2, "✓ Meta Backend Developer Specialization (Coursera / Meta) — Verified by Administration", fontsize=5.5, color="#065F46", zorder=4)


# =========================================================================
# 3. BOTTOM-LEFT: WIREFRAME 3 — STUDENT DASHBOARD WORKSPACE (/dashboard/*)
# =========================================================================
x3, y3, w3, h3 = 6, 6, 71, 51
draw_device_frame(x3, y3, w3, h3, "View 3: Student Dashboard & Portfolio Editor (/dashboard)")

# Sidebar (Left)
sb_w = 17
ax.add_patch(Rectangle((x3, y3), sb_w, h3 - 3.5, facecolor="#F8FAFC", edgecolor="#CBD5E1", lw=0.9, zorder=3))
# Mini Student Card
ax.add_patch(Circle((x3 + 3, y3 + h3 - 7.5), 1.8, facecolor=accent_indigo, zorder=4))
ax.text(x3 + 3, y3 + h3 - 7.5, "K", color="#FFF", fontsize=6.5, fontweight='bold', ha='center', va='center', zorder=5)
ax.text(x3 + 5.8, y3 + h3 - 7.0, "Keerthana A R", fontsize=6.0, fontweight='bold', color=wf_dark, zorder=4)
ax.text(x3 + 5.8, y3 + h3 - 8.5, "Roll #MCA202401", fontsize=5.0, color=wf_gray, zorder=4)

# Profile Completion Widget
ax.add_patch(FancyBboxPatch((x3 + 1.5, y3 + h3 - 14.5), sb_w - 3, 4.5, boxstyle="round,pad=0.1", facecolor="#EEF2FF", edgecolor=accent_indigo, lw=0.6, zorder=4))
ax.text(x3 + 2.5, y3 + h3 - 12, "Profile Strength", fontsize=5.5, fontweight='bold', color=accent_indigo, zorder=5)
ax.text(x3 + sb_w - 2.5, y3 + h3 - 12, "100%", fontsize=5.5, fontweight='bold', ha='right', color="#10B981", zorder=5)
# Progress Bar
ax.add_patch(Rectangle((x3 + 2.5, y3 + h3 - 13.8), sb_w - 5, 1.2, facecolor="#CBD5E1", zorder=5))
ax.add_patch(Rectangle((x3 + 2.5, y3 + h3 - 13.8), sb_w - 5, 1.2, facecolor="#10B981", zorder=6))

# Nav items
nav_y = y3 + h3 - 17.5
nav_items = [
    ("📊 Overview", True),
    ("👤 My Profile", False),
    ("🎓 Education", False),
    ("✨ Skills & Interests", False),
    ("📁 Projects (2)", False),
    ("📜 Certifications (2)", False),
    ("💼 Work Experience", False),
    ("🏆 Achievements", False),
    ("⚙️ Settings & Privacy", False)
]
for item_name, is_active in nav_items:
    if is_active:
        ax.add_patch(FancyBboxPatch((x3 + 1.2, nav_y - 2.0), sb_w - 2.4, 2.5, boxstyle="round,pad=0.1", facecolor=accent_indigo, edgecolor=accent_indigo, zorder=4))
        ax.text(x3 + 2.5, nav_y - 0.7, item_name, fontsize=5.8, fontweight='bold', color="#FFF", zorder=5)
    else:
        ax.text(x3 + 2.5, nav_y - 0.7, item_name, fontsize=5.8, color=wf_dark, zorder=4)
    nav_y -= 2.9

# Bottom Preview Button in Sidebar
ax.add_patch(FancyBboxPatch((x3 + 1.5, y3 + 2), sb_w - 3, 2.5, boxstyle="round,pad=0.1", facecolor="#F0FDFA", edgecolor=accent_teal, lw=0.7, zorder=4))
ax.text(x3 + sb_w/2, y3 + 3.3, "👁️ Preview Public URL", fontsize=5.5, ha='center', va='center', fontweight='bold', color=accent_teal, zorder=5)

# Main Canvas (Right of Sidebar)
mc_x = x3 + sb_w + 2.5
mc_w = w3 - sb_w - 5

# Welcome Banner
ax.add_patch(FancyBboxPatch((mc_x, y3 + h3 - 11), mc_w, 6.5, boxstyle="round,pad=0.2", facecolor="#FFF", edgecolor="#CBD5E1", lw=0.8, zorder=3))
ax.text(mc_x + 2.5, y3 + h3 - 7.5, "Student Dashboard Workspace", fontsize=8.0, fontweight='bold', color=wf_dark, zorder=4)
ax.text(mc_x + 2.5, y3 + h3 - 9.5, "Live Public URL: /student/keerthana-ar • Status: Active & Published", fontsize=5.8, color=wf_gray, zorder=4)

# Modal Form Schematic (Adding Project)
form_y = y3 + 2.5
form_h = 32
ax.add_patch(FancyBboxPatch((mc_x, form_y), mc_w, form_h, boxstyle="round,pad=0.2", facecolor="#FFF", edgecolor=accent_indigo, lw=1.2, zorder=3))
# Form Header
ax.text(mc_x + 2.5, form_y + form_h - 3, "ADD / EDIT PROJECT [Database Form]", fontsize=7.5, fontweight='bold', color=accent_indigo, zorder=4)
ax.add_patch(Rectangle((mc_x, form_y + form_h - 4.5), mc_w, 0.4, facecolor="#E2E8F0", zorder=3))

# Form Inputs
def draw_form_input(lbl, val, ix, iy, iw, ih=3.2):
    ax.text(ix, iy + ih + 0.8, lbl, fontsize=5.2, fontweight='bold', color=wf_dark, zorder=4)
    ax.add_patch(Rectangle((ix, iy), iw, ih, facecolor="#FFF", edgecolor="#CBD5E1", lw=0.8, zorder=4))
    ax.text(ix + 1.2, iy + ih/2, val, fontsize=5.2, va='center', color=wf_dark, zorder=5)

draw_form_input("Project Title *", "CampusHub - Interactive Navigation System", mc_x + 2.5, form_y + form_h - 9.5, 22)
draw_form_input("Category *", "Web Application / Cloud", mc_x + 26, form_y + form_h - 9.5, 20)

draw_form_input("Summary (Max 150 chars) *", "Interactive campus map and department directory with accessible wayfinding.", mc_x + 2.5, form_y + form_h - 15.5, mc_w - 5)

draw_form_input("GitHub Repository URL", "https://github.com/keerthana-ar/campushub", mc_x + 2.5, form_y + form_h - 21.5, 22)
draw_form_input("Live Production Demo URL", "https://campushub.college.edu", mc_x + 26, form_y + form_h - 21.5, 20)

# Screenshot upload field
ax.text(mc_x + 2.5, form_y + form_h - 23.5, "Project Screenshot (PNG/JPG, Max 2MB)", fontsize=5.2, fontweight='bold', color=wf_dark, zorder=4)
ax.add_patch(Rectangle((mc_x + 2.5, form_y + form_h - 27.5), mc_w - 5, 3.2, facecolor="#F8FAFC", edgecolor="#CBD5E1", lw=0.8, linestyle="--", zorder=4))
ax.text(mc_x + mc_w/2, form_y + form_h - 25.9, "[Choose File] screenshot-final.png (1.2 MB)", fontsize=5.2, ha='center', va='center', color=wf_gray, zorder=5)

# Form Action Buttons
ax.add_patch(FancyBboxPatch((mc_x + mc_w - 23, form_y + 1.5), 10, 2.5, boxstyle="round,pad=0.1", facecolor="#F1F5F9", edgecolor="#CBD5E1", zorder=4))
ax.text(mc_x + mc_w - 18, y3 + 5.2, "Cancel", fontsize=5.5, ha='center', color=wf_gray, zorder=5)
ax.add_patch(FancyBboxPatch((mc_x + mc_w - 12, form_y + 1.5), 10.5, 2.5, boxstyle="round,pad=0.1", facecolor=accent_indigo, edgecolor=accent_indigo, zorder=4))
ax.text(mc_x + mc_w - 6.75, y3 + 5.2, "Save to DB", fontsize=5.5, ha='center', fontweight='bold', color="#FFF", zorder=5)


# =========================================================================
# 4. BOTTOM-RIGHT: WIREFRAME 4 — ADMIN MODERATION & ANALYTICS (/admin/*)
# =========================================================================
x4, y4, w4, h4 = 83, 6, 71, 51
draw_device_frame(x4, y4, w4, h4, "View 4: Admin Control Center & Moderation Queue (/admin)")

# Admin Sidebar (Dark Slate)
sb4_w = 17
ax.add_patch(Rectangle((x4, y4), sb4_w, h4 - 3.5, facecolor="#0F172A", edgecolor="#334155", lw=0.9, zorder=3))
ax.text(x4 + 2.5, y4 + h4 - 7.0, "Dean of Academics", fontsize=6.2, fontweight='bold', color="#FFF", zorder=4)
ax.text(x4 + 2.5, y4 + h4 - 8.5, "admin@college.edu", fontsize=5.0, color="#94A3B8", zorder=4)

admin_nav = [
    ("📈 Overview & KPIs", False),
    ("👥 Students (5)", False),
    ("➕ Add / CSV Import", False),
    ("🛡️ Moderation (2)", True),
    ("⭐ Featured Projects", False),
    ("🏫 Depts & Batches", False),
    ("📋 Audit Logs", False)
]
a_nav_y = y4 + h4 - 13.0
for a_item, a_active in admin_nav:
    if a_active:
        ax.add_patch(FancyBboxPatch((x4 + 1.2, a_nav_y - 2.0), sb4_w - 2.4, 2.5, boxstyle="round,pad=0.1", facecolor="#B45309", edgecolor=accent_amber, zorder=4))
        ax.text(x4 + 2.5, a_nav_y - 0.7, a_item, fontsize=5.8, fontweight='bold', color="#FFF", zorder=5)
    else:
        ax.text(x4 + 2.5, a_nav_y - 0.7, a_item, fontsize=5.8, color="#CBD5E1", zorder=4)
    a_nav_y -= 3.2

# Admin Main Area
adm_x = x4 + sb4_w + 2.5
adm_w = w4 - sb4_w - 5

# Metrics Row (4 mini KPI cards)
kpis = [("Enrolled", "5", "#38BDF8"), ("Pending Certs", "2", "#FBBF24"), ("Featured Proj", "4", "#818CF8"), ("Audit Logs", "18", "#34D399")]
for k, (ktitle, kval, kcol) in enumerate(kpis):
    kx = adm_x + k * (adm_w/4)
    kw = (adm_w/4) - 1.5
    ax.add_patch(FancyBboxPatch((kx, y4 + h4 - 11.5), kw, 7.0, boxstyle="round,pad=0.1", facecolor="#1E293B", edgecolor="#334155", lw=0.8, zorder=3))
    ax.text(kx + 1.5, y4 + h4 - 7.5, ktitle, fontsize=5.0, color="#94A3B8", zorder=4)
    ax.text(kx + 1.5, y4 + h4 - 10.0, kval, fontsize=8.5, fontweight='bold', color=kcol, zorder=4)

# Moderation Queue Box
mod_y = y4 + 2.5
mod_h = 32
ax.add_patch(FancyBboxPatch((adm_x, mod_y), adm_w, mod_h, boxstyle="round,pad=0.2", facecolor="#1E293B", edgecolor="#334155", lw=1.0, zorder=3))
ax.text(adm_x + 2.5, mod_y + mod_h - 3, "INSTITUTIONAL MODERATION QUEUE", fontsize=7.2, fontweight='bold', color="#F59E0B", zorder=4)
ax.text(adm_x + adm_w - 2.5, mod_y + mod_h - 3, "[2 Claims Awaiting Dean Review]", fontsize=5.5, ha='right', color="#94A3B8", zorder=4)
ax.add_patch(Rectangle((adm_x, mod_y + mod_h - 4.5), adm_w, 0.4, facecolor="#334155", zorder=3))

# Queue Item 1
q1_y = mod_y + mod_h - 17
ax.add_patch(FancyBboxPatch((adm_x + 2, q1_y), adm_w - 4, 11.5, boxstyle="round,pad=0.1", facecolor="#0F172A", edgecolor="#334155", lw=0.8, zorder=4))
ax.text(adm_x + 3.5, q1_y + 9.5, "Meta Frontend Developer Certificate", fontsize=6.8, fontweight='bold', color="#FFF", zorder=5)
ax.add_patch(FancyBboxPatch((adm_x + adm_w - 18, q1_y + 8.8), 12, 1.8, boxstyle="round,pad=0.1", facecolor="#451A03", edgecolor="#D97706", lw=0.6, zorder=5))
ax.text(adm_x + adm_w - 12, q1_y + 9.7, "PENDING REVIEW", fontsize=4.8, ha='center', color="#FBBF24", fontweight='bold', zorder=6)
ax.text(adm_x + 3.5, q1_y + 7.2, "Student: Pooja Verma (MCA 2026 • Roll #MCA202418)", fontsize=5.5, color="#94A3B8", zorder=5)
ax.text(adm_x + 3.5, q1_y + 5.2, "Proof: 📄 cert_coursera_meta.pdf (2.4 MB) • 🔗 External Credential URL", fontsize=5.2, color="#38BDF8", zorder=5)

# Verification Actions for Item 1
ax.add_patch(FancyBboxPatch((adm_x + adm_w - 24, q1_y + 1.5), 10, 2.4, boxstyle="round,pad=0.1", facecolor="#450A0A", edgecolor="#EF4444", lw=0.6, zorder=5))
ax.text(adm_x + adm_w - 19, q1_y + 2.7, "✕ Reject", fontsize=5.2, ha='center', color="#FCA5A5", fontweight='bold', zorder=6)
ax.add_patch(FancyBboxPatch((adm_x + adm_w - 13, q1_y + 1.5), 11, 2.4, boxstyle="round,pad=0.1", facecolor="#064E3B", edgecolor="#10B981", lw=0.6, zorder=5))
ax.text(adm_x + adm_w - 7.5, q1_y + 2.7, "✓ Verify & Approve", fontsize=5.2, ha='center', color="#6EE7B7", fontweight='bold', zorder=6)

# Queue Item 2
q2_y = mod_y + 1.5
ax.add_patch(FancyBboxPatch((adm_x + 2, q2_y), adm_w - 4, 11.5, boxstyle="round,pad=0.1", facecolor="#0F172A", edgecolor="#334155", lw=0.8, zorder=4))
ax.text(adm_x + 3.5, q2_y + 9.5, "Runner Up - State Level Design Hackathon", fontsize=6.8, fontweight='bold', color="#FFF", zorder=5)
ax.add_patch(FancyBboxPatch((adm_x + adm_w - 18, q2_y + 8.8), 12, 1.8, boxstyle="round,pad=0.1", facecolor="#451A03", edgecolor="#D97706", lw=0.6, zorder=5))
ax.text(adm_x + adm_w - 12, q2_y + 9.7, "PENDING REVIEW", fontsize=4.8, ha='center', color="#FBBF24", fontweight='bold', zorder=6)
ax.text(adm_x + 3.5, q2_y + 7.2, "Student: Pooja Verma (MCA 2026 • Roll #MCA202418)", fontsize=5.5, color="#94A3B8", zorder=5)
ax.text(adm_x + 3.5, q2_y + 5.2, "Proof: 📄 hackathon_runnerup_certificate.jpg (1.8 MB)", fontsize=5.2, color="#38BDF8", zorder=5)

# Verification Actions for Item 2
ax.add_patch(FancyBboxPatch((adm_x + adm_w - 24, q2_y + 1.5), 10, 2.4, boxstyle="round,pad=0.1", facecolor="#450A0A", edgecolor="#EF4444", lw=0.6, zorder=5))
ax.text(adm_x + adm_w - 19, q2_y + 2.7, "✕ Reject", fontsize=5.2, ha='center', color="#FCA5A5", fontweight='bold', zorder=6)
ax.add_patch(FancyBboxPatch((adm_x + adm_w - 13, q2_y + 1.5), 11, 2.4, boxstyle="round,pad=0.1", facecolor="#064E3B", edgecolor="#10B981", lw=0.6, zorder=5))
ax.text(adm_x + adm_w - 7.5, q2_y + 2.7, "✓ Verify & Approve", fontsize=5.2, ha='center', color="#6EE7B7", fontweight='bold', zorder=6)


# Output paths
output_png = r"C:\Users\sruth\.gemini\antigravity\brain\d6778eea-ebd2-4bdc-bdce-aeed47c7e45a\ui_wireframe_prototypes.png"
output_jpg = r"C:\Users\sruth\.gemini\antigravity\brain\d6778eea-ebd2-4bdc-bdce-aeed47c7e45a\ui_wireframe_prototypes.jpg"
output_wp_png = r"d:\MCA-SEMESTER-1-WAD\ui_wireframe_prototypes.png"

plt.tight_layout()
plt.savefig(output_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(output_jpg, format='jpeg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(output_wp_png, format='png', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
print("Successfully generated UI Wireframe Prototype sheet!")
