#!/bin/bash

project="$1"

function on_dep_change() {
	# Only build dependencies
	if [ "$1" != "$project" ]; then
		pnpm nx run "$1":build
	fi
}

export -f on_dep_change

# Watch project and rebuild any dependency when it changes
pnpm nx watch --projects="$project" --includeDependentProjects -- on_dep_change \$NX_PROJECT_NAME