# OpenLevelUp!
# Web viewer for indoor mapping (based on OpenStreetMap data).
# Author: Adrien PAVIE
#
# Makefile

# Settings
SRC_FOLDER=./src
DIST_FOLDER=./dist
TEST_FOLDER=./test
NM_FOLDER=./node_modules
IMG_FOLDER=$(SRC_FOLDER)/img

# Binaries
BROWSERIFY=$(NM_FOLDER)/browserify/bin/cmd.js
WATCHIFY=$(NM_FOLDER)/watchify/bin/cmd.js

# Vector images
IMG_FTV := $(wildcard $(IMG_FOLDER)/features-vector/*.svg)
IMG_UIV := $(wildcard $(IMG_FOLDER)/ui-vector/*.svg)

# Test files
TEST_FILES = \
	$(TEST_FOLDER)/js/ctrl/provider/data/*.js \
	$(TEST_FOLDER)/js/ctrl/provider/picture/*.js \
	$(TEST_FOLDER)/js/ctrl/service/*.js \
	$(TEST_FOLDER)/js/model/*.js
TEST_VIEWS = \
	LevelTest.js \
	Main_AdvancedTest.js \
	Main_BasicTest.js \
	MapLayersManager_ClusterTest.js \
	MapLayersManager_FeaturesTest.js \
	MapLayersManager_NotesTest.js \
	MessagesTest.js \
	SideContent_FeatureTest.js \
	SideContent_HelpTest.js \
	SideContent_LayersTest.js \
	SideContent_NewNoteTest.js \
	SideContent_NotesTest.js \
	SideContent_SearchTest.js \
	SideTest.js \
	SpinnerTest.js

# Target files
JS_OUT=$(DIST_FOLDER)/OLU.js
JS_MIN_OUT=$(DIST_FOLDER)/OLU.min.js
CSS_OUT=$(DIST_FOLDER)/OLU.css
CSS_MIN_OUT=$(DIST_FOLDER)/OLU.min.css
TEST_OUT=$(TEST_FOLDER)/tests.js
TEST_OUT_VIEW=$(TEST_FOLDER)/*.bundle.js

# Meta tasks
all: prod
prod: images coreprod compress
dev: images coredev test


# Update images
images: imagesftv imagesuiv
	mv $(IMG_FOLDER)/features-vector/*.png $(IMG_FOLDER)/features-raster/
	mv $(IMG_FOLDER)/ui-vector/*.png $(IMG_FOLDER)/ui-raster/
	inkscape -z -e $(IMG_FOLDER)/ui-raster/logo.png $(IMG_FOLDER)/ui-vector/logo.svg

imagesftv: $(IMG_FTV:%.svg=%.png)
imagesuiv: $(IMG_UIV:%.svg=%.png)

%.png: %.svg
	inkscape -z -e $*.png -w 32 -h 32 $*.svg

# Core compile
coredev: coreprepare corebundlejs corebundlecss coreminifycss
coreprod: coreprepare corebundleminifyjs corebundlecss coreminifycss

coreprepare:
	mkdir -p $(DIST_FOLDER)
	# Copy HTML/Conf files
	cp $(SRC_FOLDER)/*.html $(DIST_FOLDER)/
	mkdir -p $(DIST_FOLDER)/styles/
	./mapcss.import.sh
	# Prepare images
	mkdir -p $(DIST_FOLDER)/img
	cp -r $(IMG_FOLDER)/features-raster/* $(DIST_FOLDER)/img/
	cp -r $(IMG_FOLDER)/ui-raster/* $(DIST_FOLDER)/img/
	cp node_modules/leaflet/dist/images/* $(DIST_FOLDER)/img/
	cp node_modules/leaflet-editinosm/edit-in-osm.png $(DIST_FOLDER)/img/
	cp node_modules/mapillary-js/dist/*.svg $(DIST_FOLDER)/img/
	# Prepare fonts
	mkdir -p $(DIST_FOLDER)/fonts
	cp node_modules/font-awesome/fonts/* $(DIST_FOLDER)/fonts/
	# Prepare locales
	cp -r $(SRC_FOLDER)/locales $(DIST_FOLDER)/

corebundlejs:
	$(BROWSERIFY) $(SRC_FOLDER)/js/OLU.js --debug --s OLU > $(JS_OUT)

corebundlecss:
	$(NM_FOLDER)/npm-css/bin/npm-css $(SRC_FOLDER)/css/OLU.css > $(CSS_OUT)
	sed -i 's#images/#img/#g;s#../fonts/#fonts/#g;s#./edit-in-osm.png#img/edit-in-osm_custom.png#g' $(CSS_OUT)
	sed -i 's#arrow-left.svg#img/arrow-left.svg#g;s#arrow-up-white.svg#img/arrow-up-white.svg#g;s#pano.svg#img/pano.svg#g;s#pano-icon.svg#img/pano-icon.svg#g;s#pointer-wheat.svg#img/pointer-wheat.svg#g;s#pointer-white.svg#img/pointer-white.svg#g;s#stepper-left.svg#img/stepper-left.svg#g;s#stepper-play.svg#img/stepper-play.svg#g;s#stepper-right.svg#img/stepper-right.svg#g;s#stepper-stop.svg#img/stepper-stop.svg#g;s#stepper-stop-small.svg#img/stepper-stop-small.svg#g;s#turn.svg#img/turn.svg#g;s#turn-around.svg#img/turn-around.svg#g' $(CSS_OUT)

coreminifyjs:
	$(NM_FOLDER)/uglify-js/bin/uglifyjs $(JS_OUT) -c > $(JS_MIN_OUT)

coreminifycss:
	$(NM_FOLDER)/uglifycss/uglifycss --ugly-comments $(CSS_OUT) > $(CSS_MIN_OUT)

corebundleminifyjs:
	$(BROWSERIFY) $(SRC_FOLDER)/js/OLU.js --s OLU | $(NM_FOLDER)/uglify-js/bin/uglifyjs -c > $(JS_MIN_OUT)


# Test
test: testcorejs testcoreviews
testcorejs:
	$(BROWSERIFY) --debug $(TEST_FILES) > $(TEST_OUT)
testcoreviews:
	for i in $(TEST_VIEWS); do $(BROWSERIFY) --debug $(TEST_FOLDER)/js/view/$$i > $(TEST_FOLDER)/View_$$i.bundle.js; done


# Watch for changes
watch:
	$(WATCHIFY) $(SRC_FOLDER)/js/OLU.js --debug --s OLU -o $(JS_OUT) -v
watchtest:
	$(WATCHIFY) --debug $(TEST_FILES) -o $(TEST_OUT) -v
watchview:
	$(WATCHIFY) --debug $(TEST_FOLDER)/js/view/$(name)Test.js -o $(TEST_FOLDER)/View_$(name)Test.js.bundle.js -v


# Dist zip
compress:
	rm -f ./dist.zip
	zip -9 -r ./dist.zip dist/


# Clean
clean:
	rm -rf $(DIST_FOLDER)/*
	rm -f $(TEST_OUT) $(TEST_OUT_VIEW)
	rm -f $(IMG_FOLDER)/features-vector/*.png
	rm -f $(IMG_FOLDER)/ui-vector/*.png
