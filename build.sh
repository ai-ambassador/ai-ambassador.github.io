git checkout dev
rm -rf /tmp/ai-ambassadors-build
hugo -d ai-ambassadors-build
mv ai-ambassadors-build /tmp/
git checkout master
rm -rf ./*
mv /tmp/ai-ambassadors-build .

