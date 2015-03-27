all: dist/philote.js dist/philote.min.js

dist/%.js: src/%.js
	$(eval VERSION = $(shell node -e 'console.log(require("package.json").version)'))
	cat $< | sed -e 's/@VERSION@/$(VERSION)/' > $@

dist/%.min.js: dist/%.js node_modules/.up-to-date
	uglifyjs $< --mangle --compress --output $@

node_modules/.up-to-date: package.json
	npm install
	touch $@

.PHONY: all
