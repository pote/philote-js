all: philote.min.js

%.min.js: %.js dependencies
	uglifyjs $< --mangle --compress > $@

dependencies:
	npm install

.PHONY: dependencies
