git checkout dev
rm -rf /tmp/ai-ambassadors-build
mkdir /tmp/ai-ambassadors-build
hugo -d /tmp/ai-ambassadors-build
git checkout master rm -rf *
mv /tmp/ai-ambassadors-build .

