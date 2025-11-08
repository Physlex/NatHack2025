#!/bin/bash

set -e  # Exit on error

TOOLCHAIN_URL="https://developer.arm.com/-/media/Files/downloads/gnu/14.3.rel1/binrel/arm-gnu-toolchain-14.3.rel1-x86_64-arm-none-eabi.tar.xz"
ARCHIVE_NAME="arm-gnu-toolchain-14.3.rel1-x86_64-arm-none-eabi.tar.xz"
VENDOR_DIR="vendor"

echo "Downloading ARM GNU Toolchain..."
wget -O "$ARCHIVE_NAME" "$TOOLCHAIN_URL"

echo "Creating vendor directory..."
mkdir -p "$VENDOR_DIR"

echo "Extracting toolchain to vendor directory..."
tar -xJf "$ARCHIVE_NAME" -C "$VENDOR_DIR"

echo "Cleaning up archive..."
rm "$ARCHIVE_NAME"

echo "ARM GNU Toolchain installed successfully in $VENDOR_DIR/"
echo "To use the toolchain, add the following to your PATH:"
echo "export PATH=\"\$PATH:\$(pwd)/$VENDOR_DIR/arm-gnu-toolchain-14.3.rel1-x86_64-arm-none-eabi/bin\""
