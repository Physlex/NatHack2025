#!/bin/bash

set -e  # Exit on error

VENDOR_DIR="vendor"
TOOLCHAIN_DIR="$VENDOR_DIR/arm-gnu-toolchain-14.3.rel1-x86_64-arm-none-eabi"
GCC_BIN="$TOOLCHAIN_DIR/bin/arm-none-eabi-gcc"

# Check if the ARM GNU Toolchain is already installed
if [ -f "$GCC_BIN" ]; then
    echo "ARM GNU Toolchain already installed in $TOOLCHAIN_DIR"
else
    echo "ARM GNU Toolchain not found. Installing..."
    ./get_gcc.sh
fi

# Add toolchain to PATH
export PATH="$PATH:$(pwd)/$TOOLCHAIN_DIR/bin"

echo "ARM GNU Toolchain is ready to use."
echo "Current PATH includes: $(pwd)/$TOOLCHAIN_DIR/bin"
