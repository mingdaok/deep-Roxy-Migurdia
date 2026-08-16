# 洛琪希·星穹水神书库

一个面向 DeepSeek Harness 的洛琪希灵感视觉皮肤。整体采用深海藏蓝、冰蓝星辉与古金饰线，并加入异世界魔法学院暮色背景、侧栏魔法纹样、角色立绘和水神魔法输入框装饰。

![设计预览](docs/preview.png)

## 特点

- 按照确认后的效果图实现桌面端视觉。
- 人物、背景、侧栏与输入框装饰均以本地 WebP 资源打包。
- 运行时不依赖 CDN、外部字体或远程图片。
- 支持窄屏人物隐藏与减少动态效果偏好。
- 构建配置不包含本机绝对路径，可直接放入 GitHub 仓库。
- 卸载插件时会恢复页面标题、主题色并清理注入节点与监听器。

## 环境要求

- Node.js 22 或更高版本
- pnpm 10.15 或更高版本
- 本地 DeepSeek Harness

## 构建

```bash
pnpm install
pnpm run check
```

## 安装到 DeepSeek Harness

在仓库根目录执行：

```bash
dsh plugin --profile web add "$PWD"
```

随后重启 Harness Web 服务并刷新浏览器。`cordis.patch.yml` 会将客户端插件注册为 `@dsh-external/dsh-client-ui-skin-roxy`。

## 目录结构

```text
assets/                 本地 WebP 视觉资源
src/client/             浏览器端皮肤逻辑与样式
src/index.ts            宿主端空入口
scripts/                构建维护脚本
.github/workflows/      GitHub Actions 检查
cordis.patch.yml        Harness 插件注册配置
skin.json               皮肤信息与配色
tsdown.config.ts        可移植的双端构建配置
```

## 美术素材说明

本项目为非官方同人主题。仓库内插画根据用户确认的设计方向与参考素材为本项目生成，并非官方素材；建议仅用于个人、非商业用途。《无职转生》与洛琪希·米格路迪亚相关权利归各自权利方所有。

## 架构致谢

输入框的阶段处理与九宫格边框方案参考了 [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)。本项目使用独立生成的洛琪希主题美术，并保留 Harness 原生控件与交互。

## 许可证

代码采用 [MIT License](LICENSE)。仓库内视觉素材另受上方美术素材说明约束。
