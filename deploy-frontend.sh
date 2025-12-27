#!/bin/bash
################################################################################
# 前端热更新部署脚本
# 功能：自动构建前端并通过软链接切换实现零停机热更新
# 使用：./deploy-frontend.sh
################################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/www/wwwroot/Parking-vue"
CURRENT_LINK="$PROJECT_DIR/dist"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  前端热更新部署开始${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 检测当前运行版本
cd "$PROJECT_DIR"
if [ -L "$CURRENT_LINK" ]; then
    CURRENT_VERSION=$(readlink "$CURRENT_LINK")
    echo -e "${YELLOW}当前版本: $CURRENT_VERSION${NC}"

    if [[ "$CURRENT_VERSION" == "dist-8081" ]]; then
        NEW_VERSION="dist-8082"
        OLD_VERSION="dist-8081"
    else
        NEW_VERSION="dist-8081"
        OLD_VERSION="dist-8082"
    fi
else
    echo -e "${RED}错误: dist软链接不存在${NC}"
    exit 1
fi

echo -e "${GREEN}新版本将部署到: $NEW_VERSION${NC}"

# 2. 拉取最新代码（可选，根据需要取消注释）
# echo -e "${YELLOW}拉取最新代码...${NC}"
# git pull origin main

# 3. 安装依赖（如果package.json有变化）
# echo -e "${YELLOW}检查依赖...${NC}"
# npm install

# 4. 构建新版本
echo -e "${YELLOW}开始构建前端项目...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败，终止部署${NC}"
    exit 1
fi

# 5. 清空并复制构建产物到新版本目录
echo -e "${YELLOW}部署到 $NEW_VERSION ...${NC}"
rm -rf "$PROJECT_DIR/$NEW_VERSION"/*
cp -r "$PROJECT_DIR/dist/"* "$PROJECT_DIR/$NEW_VERSION/"

# 6. 验证新版本文件
if [ ! -f "$PROJECT_DIR/$NEW_VERSION/index.html" ]; then
    echo -e "${RED}错误: 新版本缺少index.html文件${NC}"
    exit 1
fi

echo -e "${GREEN}新版本文件验证通过${NC}"

# 7. 原子切换软链接
echo -e "${YELLOW}切换软链接到新版本...${NC}"
ln -snf "$NEW_VERSION" "$CURRENT_LINK"

# 8. 重载Nginx（优雅重启）
echo -e "${YELLOW}重载Nginx配置...${NC}"
/www/server/nginx/sbin/nginx -t
if [ $? -eq 0 ]; then
    /www/server/nginx/sbin/nginx -s reload
    echo -e "${GREEN}Nginx重载成功${NC}"
else
    echo -e "${RED}Nginx配置测试失败，回滚...${NC}"
    ln -snf "$OLD_VERSION" "$CURRENT_LINK"
    exit 1
fi

# 9. 显示部署结果
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  前端热更新部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "当前版本: ${GREEN}$NEW_VERSION${NC}"
echo -e "旧版本: ${YELLOW}$OLD_VERSION${NC} (已保留，可快速回滚)"
echo ""
echo -e "访问地址: ${GREEN}https://test001.cn${NC}"
echo ""
echo -e "如需回滚，执行: ${YELLOW}ln -snf $OLD_VERSION $CURRENT_LINK && nginx -s reload${NC}"
