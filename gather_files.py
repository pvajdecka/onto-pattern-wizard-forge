#!/usr/bin/env python3
"""
gather_files.py
---------------
Recursively scans a root directory for files with certain extensions,
while excluding specified directories AND specified files by name.

- By default, excludes ".venv" and "__pycache__" folders.
- By default, excludes "gather_files.py" file so it is never included in the final .txt output.

Then merges all matching files into one .txt file, tagging each file's content
with "<relative_path>:\n<file_content>\n\n".
"""

import os
import argparse

def gather_files(root_dir: str,
                 extensions: list[str],
                 exclude_dirs: list[str],
                 exclude_files: list[str]) -> list[str]:
    """
    Recursively find all files in `root_dir` with extensions in `extensions`,
    skipping directories listed in `exclude_dirs` and files in `exclude_files`.
    Returns a list of absolute paths to the matching files.
    """
    matched_files = []
    exclude_files_set = set(exclude_files)
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Remove excluded directories so os.walk won't descend into them
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]

        for filename in filenames:
            if filename in exclude_files_set:
                # Skip this file by name
                continue

            file_ext = os.path.splitext(filename)[1]
            if file_ext in extensions:
                abs_path = os.path.join(dirpath, filename)
                matched_files.append(abs_path)

    return matched_files

def merge_files_to_txt(files: list[str], root_dir: str, output_file: str):
    """
    Reads each file in `files` and writes them into `output_file` with format:

        <relative_path>:
        <file contents>

        <blank line>
    """
    with open(output_file, "w", encoding="utf-8") as out:
        for fpath in files:
            rel_path = os.path.relpath(fpath, start=root_dir)
            out.write(f"{rel_path}:\n")
            with open(fpath, "r", encoding="utf-8", errors="replace") as fin:
                contents = fin.read()
            out.write(contents.rstrip() + "\n\n")  # blank line after each file

def main():
    parser = argparse.ArgumentParser(
        description="Merge files into one .txt while excluding certain dirs and files."
    )
    parser.add_argument(
        "--root",
        default=".",
        help="Root directory to start searching from (default: current directory).",
    )
    parser.add_argument(
        "--extensions",
        nargs="+",
        default=[".py",".txt",".sql",".sh",".toml"], # 
        help='File extensions to include (default: [".py"]). '
             'Example: --extensions ".py" ".txt"',
    )
    parser.add_argument(
        "--exclude-dirs",
        nargs="+",
        default=[".venv", "__pycache__"],
        help='Directory names to exclude (default: [".venv", "__pycache__"]). '
             'Example: --exclude-dirs ".git" ".venv" "node_modules"',
    )
    parser.add_argument(
        "--exclude-files",
        nargs="+",
        default=["gather_files.py",".txt"],
        help='File names to exclude (default: ["gather_files.py"]). '
             'Example: --exclude-files "setup.py" "secret.py"',
    )
    parser.add_argument(
        "--output",
        default="merged_files.txt",
        help="Name of the output .txt file (default: merged_files.txt).",
    )
    args = parser.parse_args()

    matched_files = gather_files(
        root_dir=args.root,
        extensions=args.extensions,
        exclude_dirs=args.exclude_dirs,
        exclude_files=args.exclude_files,
    )
    merge_files_to_txt(matched_files, args.root, args.output)
    print(f"Done! Merged {len(matched_files)} file(s) into '{args.output}'.")

if __name__ == "__main__":
    main()

