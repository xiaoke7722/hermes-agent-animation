# 2.5D 像素小人 AI 生成提示词

## 🎨 2.5D 角色设计提示词

### 主 Agent (蓝色程序员)
```
2.5D isometric pixel art character, 24x32 pixels, cute chibi style, 
male programmer with blue hoodie, brown hair, typing on laptop, 
warm lighting, transparent background, game sprite sheet format, 
Dave the Diver pixel art style, clean sharp pixels, no anti-aliasing, 
retro game aesthetic, isometric view, 3D effect

工作状态: 2.5D pixel art character typing on keyboard, focused expression, 
blue glow effect, 24x32 sprite, multiple animation frames, isometric view

思考状态: 2.5D pixel art character thinking, hand on chin, 
thought bubble above head, purple glow, 24x32 sprite, 
multiple animation frames, isometric view

空闲状态: 2.5D pixel art character standing idle, slight breathing animation, 
24x32 sprite, multiple animation frames, isometric view
```

### 子 Agent (绿色助手)
```
2.5D isometric pixel art character, 24x32 pixels, cute chibi style, 
female assistant with green shirt, gray hair, carrying data blocks, 
warm lighting, transparent background, game sprite sheet format, 
Dave the Diver pixel art style, clean sharp pixels, no anti-aliasing, 
retro game aesthetic, isometric view, 3D effect

工作状态: 2.5D pixel art character working on computer, 
green glow effect, 24x32 sprite, multiple animation frames, isometric view

协作状态: 2.5D pixel art character discussing with others, 
speech bubble, 24x32 sprite, multiple animation frames, isometric view
```

## 🏢 2.5D 办公室背景提示词

### 整体背景
```
2.5D isometric pixel art office background, 900x600 pixels, 
warm cozy workspace, wooden desk, computer monitors, bookshelves, 
plants, large windows with sunlight, Dave the Diver art style, 
soft warm lighting, retro game aesthetic, detailed pixel art, 
isometric view, 3D effect, depth perception

变体1: 2.5D morning office with golden sunlight, isometric view
变体2: 2.5D evening office with warm lamp lighting, isometric view  
变体3: 2.5D night office with monitor glow, isometric view
```

### 2.5D 办公室元素
```
桌面: 2.5D isometric pixel art wooden desk with laptop, coffee cup, 
notebook, 32x32 pixels, 3D effect

书架: 2.5D isometric pixel art bookshelf with colorful books, 
64x32 pixels, 3D effect

植物: 2.5D isometric pixel art potted plant, green leaves, 
16x32 pixels, 3D effect

窗户: 2.5D isometric pixel art window with sunlight rays, 
48x48 pixels, 3D effect

显示器: 2.5D isometric pixel art computer monitor with code, 
24x24 pixels, 3D effect

咖啡杯: 2.5D isometric pixel art coffee cup with steam, 
8x8 pixels, 3D effect
```

## ✨ 2.5D 特效提示词

### 粒子效果
```
Sparkle particles: 2.5D isometric yellow star-shaped particles, 
floating animation, 4x4 pixels each, warm golden glow, 3D effect

Dust particles: 2.5D isometric small golden dust motes, 
subtle floating, 2x2 pixels, soft opacity, 3D effect

Light rays: 2.5D isometric warm sunlight beams from window, 
semi-transparent, golden color, 3D effect
```

### UI 元素
```
状态框: 2.5D isometric pixel art status panel, dark background, 
rounded corners, white text, minimal design, 64x20 pixels, 3D effect

任务框: 2.5D isometric pixel art task card, yellow accent, 
clipboard icon, 70x16 pixels, 3D effect

进度条: 2.5D isometric pixel art progress bar, white fill on dark background, 
rounded ends, 60x6 pixels, 3D effect
```

## 🎯 2.5D 使用建议

### 推荐 AI 工具
1. **Midjourney** - 最适合生成2.5D像素艺术
2. **Stable Diffusion** - 可以使用2.5D像素艺术 LoRA
3. **DALL-E 3** - 适合生成可爱2.5D风格
4. **Aseprite AI** - 专业像素艺术工具

### 提示词优化技巧
1. 添加 `2.5D isometric` 和 `24x32 pixels` 指定风格和尺寸
2. 使用 `transparent background` 便于集成
3. 添加 `multiple animation frames` 获取动画数据
4. 使用 `Dave the Diver style` 参考游戏风格
5. 添加 `clean sharp pixels, no anti-aliasing` 确保清晰度
6. 添加 `isometric view, 3D effect` 强调2.5D效果

### 动画帧生成
```
建议生成以下动画帧:
- 空闲: 2帧 (轻微呼吸)
- 工作: 4帧 (打字动作)
- 思考: 3帧 (手托腮)
- 行走: 4帧 (走路循环)
- 协作: 2帧 (对话动作)
```

## 📁 文件格式

生成的像素艺术应该保存为:
- **格式**: PNG (透明背景)
- **尺寸**: 单个精灵 24x32 或 32x48
- **精灵表**: 水平排列所有动画帧
- **命名**: character_idle_01.png, character_work_01.png 等

## 🔧 集成说明

生成后需要:
1. 将像素艺术转换为数组数据
2. 更新 `pixelArt.ts` 中的精灵图数据
3. 调整颜色索引
4. 测试动画效果

## 🎨 2.5D 风格特点

### 等距视角
- 30度角俯视
- 菱形网格
- 立体感强

### 3D 效果
- 阴影和高光
- 深度感知
- 立体物体

### 像素艺术
- 清晰像素边缘
- 无抗锯齿
- 复古游戏美学
