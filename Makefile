TRACEUR=traceur
TRACEUR_FEATURES=--async-functions=true --modules=inline \
				 --classes=parse --generators=parse \
				 --arrow-functions=parse --block-binding=parse --for-of=parse
TRACEUR_LEGACY_FEATURES=--experimental
TRACEUR_DEBUG_FLAGS=--source-maps=inline
TRACEUR_RELEASE_FLAGS=
TRACEUR_OUTPUT_DIR=output
TRACEUR_OUTPUT=$(TRACEUR_OUTPUT_DIR)/compiled.js
TRACEUR_OUT=--out=$(TRACEUR_OUTPUT)
JS_SRC_DIR=src
JS_SRC_FILES=$(JS_SRC_DIR)/*.js

WATCHCMD=inotifywait -qre close_write $(JS_SRC_DIR)

.PHONY: watch clean rmtemp stripwhitespace debug

all: debug

debug: $(JS_SRC_FILES)
	$(TRACEUR) $(TRACEUR_FEATURES) $(TRACEUR_DEBUG_FLAGS) $(TRACEUR_OUT) $^

release: $(JS_SRC_FILES)
	$(TRACEUR) $(TRACEUR_FEATURES) $(TRACEUR_RELEASE_FLAGS) $(TRACEUR_OUT) $^

legacy: legacy-debug
legacy-debug: $(JS_SRC_FILES)
	$(TRACEUR) $(TRACEUR_LEGACY_FEATURES) $(TRACEUR_DEBUG_FLAGS) $(TRACEUR_OUT) $^
legacy-release: $(JS_SRC_FILES)
	$(TRACEUR) $(TRACEUR_LEGACY_FEATURES) $(TRACEUR_RELEASE_FLAGS) $(TRACEUR_OUT) $^

watch:
	while true; do sync; make $(WATCHMAKE); $(WATCHCMD); done

clean:
	rm -rf $(TRACEUR_OUTPUT_DIR)

rmtemp:
	find src -name '.*' -exec rm {} \;

stripwhitespace:
	find -name '*.ls' -exec sed -i 's/ *$$//' {} \;
