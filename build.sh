#!/bin/bash

# installs dependencies
yarn --cwd Resources/Private/JavaScript/LazyDataSource

# builds the app
yarn --cwd Resources/Private/JavaScript/LazyDataSource build
