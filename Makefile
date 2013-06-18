OUTPUT=build/glen.min.js
_FILES=core.js utility.js postprocessing.js controls.js entity.js world.js
FILES=$(patsubst %,src/%,$(_FILES))
COMMENT=// Glen - github.com/willcrichton/glen

all:
	echo "$(COMMENT)" > $(OUTPUT)
	uglifyjs $(FILES) >> $(OUTPUT)
