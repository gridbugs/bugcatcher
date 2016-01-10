TRACEUR=traceur
TRACEUR_FEATURES=--experimental
TRACEUR_FLAGS=--source-maps=inline
TRACEUR_OUTPUT_DIR=output
TRACEUR_OUTPUT=$(TRACEUR_OUTPUT_DIR)/compiled.js
JS_SRC_DIR=src
JS_SRC_FILES=$(JS_SRC_DIR)/*.js

.PHONY: watch clean rmtemp stripwhitespace

all: $(TRACEUR_OUTPUT)

$(TRACEUR_OUTPUT): $(JS_SRC_FILES)
	$(TRACEUR) $(TRACEUR_FEATURES) $(TRACEUR_FLAGS) --out $(TRACEUR_OUTPUT) $^

watch:
	while true; do make $(WATCHMAKE); inotifywait -qre close_write $(JS_SRC_DIR); done

clean:
	rm -rf $(TRACEUR_OUTPUT_DIR)

rmtemp:
	find src -name '.*' -exec rm {} \;

stripwhitespace:
	find -name '*.ls' -exec sed -i 's/ *$$//' {} \;
