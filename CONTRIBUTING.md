# Contributing to DiffLens

Thank you for your interest in contributing to DiffLens!

## Development Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/difflens.git
    cd difflens
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Build the project**
    ```bash
    npm run build
    ```

4.  **Run tests**
    ```bash
    # Run unit tests (if any)
    npm test

    # Run the CLI against the example scenario
    npm start test
    ```

## Project Structure

- `src/cli.ts`: CLI entry point.
- `src/core/`: Core logic (capture, compare, a11y, runner).
- `src/config.ts`: Configuration loader.
- `src/types.ts`: Type definitions.

## Pull Requests

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Commit your changes with clear messages.
4.  Push to your fork and submit a Pull Request.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
