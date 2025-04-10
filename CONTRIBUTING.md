# Contributing to Gemini Grammar Check

Thank you for your interest in contributing to this project! Here's how you can help.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/gemini-grammar-check.git
   cd gemini-grammar-check
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your Gemini API key in VS Code settings

## Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run the extension in debug mode:
   - Open the project in VS Code
   - Press F5 to launch a new window with your extension loaded

4. Test your changes thoroughly

5. Build and lint your code:
   ```bash
   npm run build
   ```

6. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

8. Create a Pull Request from your fork to the main repository

## Continuous Integration

This project uses GitHub Actions for automated testing and releases:

1. **Pull Request Validation**: All PRs are automatically tested
   - TypeScript compilation
   - Linting
   - Builds are verified

2. **Automated Testing**: Any push to the main branch runs tests
   - Ensures code quality is maintained

3. **Release Builds**: Tagging a version automatically builds the extension
   - Create a tag starting with 'v' (e.g., v0.1.3)
   - GitHub Actions will build, package, and create a release

## Creating Releases

To create a new release:

1. Update version in package.json
2. Update CHANGELOG.md with the changes
3. Commit these changes: `git commit -am "Bump version to x.y.z"`
4. Run `npm run create-release` to create and push a tag
5. GitHub Actions will handle the rest automatically

## Code Style

- Follow the existing code style
- Use TypeScript features appropriately
- Add comments for complex logic
- Ensure your code is properly linted

## Feature Requests and Bug Reports

Please use the GitHub Issues section to report bugs or request features.

## Documentation

If you're adding new features, please update the documentation accordingly:
- README.md for main feature descriptions
- USAGE.md for detailed usage instructions
- Update any other relevant docs

## Testing

- Test your features in different environments if possible
- Consider edge cases, especially with text sanitization and API responses
- Ensure the extension works well in the VS Code UI

## License

By contributing, you agree that your contributions will be licensed under the project's license.