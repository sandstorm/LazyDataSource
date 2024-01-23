#!/bin/bash
############################## DEV_SCRIPT_MARKER ##############################
# This script is used to document and run recurring tasks in development.     #
#                                                                             #
# You can run your tasks using the script `./dev some-task`.                  #
# You can install the Sandstorm Dev Script Runner and run your tasks from any #
# nested folder using `dev some-task`.                                        #
# https://github.com/sandstorm/Sandstorm.DevScriptRunner                      #
###############################################################################

set -e

######### TASKS #########

function clean() {
  rm -Rf Resources/Private/JavaScript/LazyDataSource/node_modules
}

function setup() {
  cd Resources/Private/JavaScript/LazyDataSource
  yarn install
}

function watch() {
  # https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported
  export NODE_OPTIONS=--openssl-legacy-provider

  cd Resources/Private/JavaScript/LazyDataSource
  yarn run watch
}

function build() {
  # https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported
  export NODE_OPTIONS=--openssl-legacy-provider

  cd Resources/Private/JavaScript/LazyDataSource
  yarn run build
}


####### Utilities #######

_log_success() {
  printf "\033[0;32m%s\033[0m\n" "${1}"
}
_log_warning() {
  printf "\033[1;33m%s\033[0m\n" "${1}"
}
_log_error() {
  printf "\033[0;31m%s\033[0m\n" "${1}"
}

# THIS NEEDS TO BE LAST!!!
# this will run your tasks
"$@"
