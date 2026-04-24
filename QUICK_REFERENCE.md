# Quick Reference: Writing & Games

## 🎯 Quick Start (60 seconds)

### Add a Writing in 60 Seconds:
1. Go to **#/admin** in your site
2. Fill the **"Write & Post"** form
3. Click **"Create & Copy"** button
4. Paste the code into `src/data/content.js` in the `writings` array
5. Reload and see your post live! ✅

### Add a Game in 2 Minutes:
1. Create folder: `/static/games/my-game/`
2. Upload game files (index.html + assets)
3. Go to **#/admin** → **"Add Game"** tab
4. Fill the form
5. Click **"Create & Copy"** button
6. Paste into `src/data/content.js` in the `games` array
7. Done! 🎮

---

## 📝 Writing Fields Explained

| Field | What it is | Example |
|-------|-----------|---------|
| **Title** | Your post headline | "When the City Sleeps" |
| **Category** | Which collection it belongs to | "3 A.M. Dump" |
| **Excerpt** | Short preview (shown in lists) | "It's 3 a.m. again..." |
| **Content** | Full post text | Your complete story |
| **Mood** | Emoji to set the vibe | 🌙 ☀️ 💔 |
| **Read Time** | How long to read | "4 min read" |

### Writing Tips:
- ✅ Use blank lines to separate paragraphs
- ✅ Use `**text**` for **bold**
- ✅ Use `*text*` for *italics*
- ✅ Date is auto-generated as today's date
- ✅ ID is auto-generated from title

---

## 🎮 Game Fields Explained

| Field | What it is | Example |
|-------|-----------|---------|
| **Type** | Game platform | "Web", "Unity", "PC", "Mobile" |
| **Platform** | Technical platform | "WebGL", "Windows", "Android" |
| **Genre** | Game category | "Platformer", "RPG", "Puzzle" |
| **Embed URL** | Where to play (web games) | `/static/games/my-game/index.html` |
| **Download URL** | Where to download (PC/mobile) | Google Drive or itch.io link |
| **Thumbnail** | Game cover image | `/static/games/my-game/thumb.jpg` |
| **How to Play** | Control instructions | "WASD to move", "Space to jump" |
| **Tags** | Keywords | "Action", "2D", "Pixel Art" |

### Game Setup:

**For Web Games:**
```
/static/games/my-web-game/
├── index.html          ← Your game's main file
├── script.js
├── style.css
├── assets/
│   ├── sprites/
│   ├── sounds/
│   └── maps/
└── thumb.jpg           ← Game thumbnail
```

**For Unity WebGL:**
```
/static/games/my-unity-game/
├── index.html          ← Build output
├── Build/              ← Unity Build folder
│   ├── game.wasm
│   ├── game.js
│   └── ...
└── thumb.jpg
```

### Game URLs:

**Web Games:**
- `embedUrl`: `/static/games/my-game/index.html`

**Unity Games:**
- `embedUrl`: `/static/games/unity-build/index.html`

**Download Links (Google Drive):**
1. Upload ZIP to Google Drive
2. Share it (anyone with link)
3. Get file ID from: `https://drive.google.com/file/d/FILE-ID/view`
4. Download link: `https://drive.google.com/uc?export=download&id=FILE-ID`

**Download Links (itch.io - RECOMMENDED):**
1. Create account at itch.io
2. Create new game page
3. Upload your files
4. Copy download link from your project

---

## 📂 File Locations

```
YourSite/
├── src/
│   ├── data/
│   │   └── content.js          ← Add writings & games here ⭐
│   ├── pages/
│   │   ├── home.js
│   │   ├── writings.js
│   │   ├── games.js
│   │   ├── messages.js
│   │   └── admin.js            ← New admin panel
│   └── styles/
│       └── admin.css           ← New admin styles
├── static/
│   ├── games/                  ← Your games go here ⭐
│   │   ├── game-1/
│   │   │   ├── index.html
│   │   │   └── assets/
│   │   └── game-2/
│   ├── eunioaa.png
│   └── aru.png
└── index.html
```

---

## 🔗 Accessing the Admin Panel

Go to: **`yoursite.com/#/admin`**

Or add this link to your navbar/navigation.

---

## ✨ Example Writing Entry

```javascript
{
  id: 'lost-in-code-2025-04',
  category: '3am-dump',
  title: 'Lost in Code',
  excerpt: 'When you code so late you forget why you started...',
  content: `It was 2:47 AM when I realized something had to change.

I was sitting on the rooftop with cold coffee and regrets when the thought hit me like a car crash in slow motion.

All this time, I've been building things to impress people who don't matter.

I think I need to start building for me instead.`,
  date: 'April 20, 2025',
  readTime: '3 min read',
  mood: '💻'
}
```

## ✨ Example Game Entry

```javascript
{
  id: 'flappy-bird',
  title: 'Flappy Bird Clone',
  type: 'web',
  platform: 'WebGL',
  genre: 'Arcade',
  thumbnail: '/static/games/flappy-bird/thumb.jpg',
  embedUrl: '/static/games/flappy-bird/index.html',
  downloadUrl: null,
  description: 'A fun Flappy Bird inspired game. Tap to fly and avoid pipes!',
  howToPlay: [
    'Click or tap to make bird fly',
    'Avoid the green pipes',
    'Get the highest score'
  ],
  tags: ['Arcade', '2D', 'Fun'],
  year: 2025,
  featured: true
}
```

---

## 🐛 Troubleshooting

**Game not showing?**
- Check `type` is correct ('web', 'unity', 'pc', 'mobile')
- Check `id` is unique (no duplicates)
- Check both embed and download URLs are valid

**Embed not working?**
- Make sure `embedUrl` points to actual HTML file
- For web games: use full path `/static/games/game-name/index.html`
- Test path in browser to confirm it works

**Image missing?**
- Check path starts with `/` and is correct
- Verify image exists in `/static/` folder
- Use absolute paths, not relative

**Writing not appearing?**
- Check `category` matches existing category ID
- Check `id` is unique
- Make sure it's added to the `writings` array (not outside)

**Getting errors?**
- Check JSON syntax (quotes, commas, brackets)
- Use online JSON validator
- Check console for specific error message

---

## 🚀 Pro Tips

1. **Backup content.js** before making changes
2. **Use the admin panel** to generate code instead of typing manually
3. **Test images** by opening the URL in a new tab
4. **Use descriptive titles** for games and writings
5. **Add featured games** to highlight your best work
6. **Use tags** to help categorize games
7. **Write honest descriptions** - they help players decide

---

## 📞 Support

If something isn't working:
1. Check SETUP_GUIDE.md for detailed instructions
2. Verify file paths are correct
3. Open browser console (F12) for error messages
4. Try the example entries above
5. Compare your entry with existing ones

Happy creating! 🎉
