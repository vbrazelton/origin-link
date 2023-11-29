<p align="center">
  <img src="./assets/logo.webp" alt="Origin-Link Logo" width="300"/>
</p>

# Origin Link

A Visual Studio Code extension that allows users to create a link to the remote origin of a selected line or range of code.

## Features

- Generate a link to the remote origin of a selected line of code.
- Generate a link to the remote origin of a selected range of code.
- Works with both SSH and HTTPS git origins.
- Supports Bitbucket URLs.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the square icon on the sidebar, or press `Ctrl+Shift+X`.
3. Search for "Origin Link" and install it.

## Usage

1. Open a file in Visual Studio Code.
2. Select a line or range of code.
3. Right-click and choose "Get Origin Link" to copy the link to your clipboard.
4. You can also choose "Open Origin Link" to open the link in your default web browser.

## Configuration

No additional configuration is needed.

## Contributing

If you find any issues or have a feature request, please open an issue on the [GitHub repository](https://github.com/vbrazelton/origin-link).

 Note: Handling various git providers is surprisingly tricky. Please include the following with any issue:
  1. Push and Fetch URLs
      * run `git remote show origin` in the root of your project
  2. An example of a correct url for your remote repository
      * Needed in order to validate correct output. No access to the remote repository is needed.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
