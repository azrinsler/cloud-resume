# Kotlin Utility

This project can be built and deployed using the GitHub Packages Build Pipeline (packages.yml) workflow file.

> [!Important]
> Attempting to publish this artifact to GitHub Packages without updating the artifact version in the pom file will 
> result in failure! Duplicate versions do not overwrite — they simply fail! Most likely with something along the lines 
> of "Failed to retrieve remote metadata azrinsler:blah blah blah: status code: 400, reason phrase: Bad Request (400)".