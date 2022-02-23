#!/bin/bash

# Replace a MapCSS @import line with actual content of wanted MapCSS
# Use: mapcss.import.sh <file_to_read>

STYLE_FOLDER=./src/styles
OUTPUT_FOLDER=./dist/styles
IFS=''

function process {
	regex="^@import url\('(.*)'\)\;$"

	# Read MapCSS
	cat $1 | while read line; do
		# If @import markup, import file
		if [[ $line =~ $regex ]]; then
			# Check if file exists
			if ! test -r $STYLE_FOLDER/${BASH_REMATCH[1]}; then
				echo "File ${BASH_REMATCH[1]} not readable"
			else
				echo "/** Import of ${BASH_REMATCH[1]} **/"
				process $STYLE_FOLDER/${BASH_REMATCH[1]}
			fi
		# If not, echo line
		else
			echo "$line"
		fi
	done
}

for i in $STYLE_FOLDER/*.mapcss; do
	output=$OUTPUT_FOLDER/`basename $i`
	
	process $i > $output
done
