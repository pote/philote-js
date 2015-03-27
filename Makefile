all: dist/philote.js dist/philote.min.js

dist/%.js: src/%.js dist/.license.js
	$(eval VERSION = $(shell node -e 'console.log(require("package.json").version)'))
	cat dist/.license.js $< | sed -e 's/@VERSION@/$(VERSION)/' > $@

dist/%.min.js: dist/%.js dist/.license.js node_modules/.up-to-date
	uglifyjs $< --mangle --compress | cat dist/.license.js - > $@

dist/.license.js: LICENSE
	sed -e 's:^:// :' -e 's/ *$$//' <$< >$@

node_modules/.up-to-date: package.json
	npm install
	touch $@

.PHONY: all
