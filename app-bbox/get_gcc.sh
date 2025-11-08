wget -P vendor/arm.tar.xz https://developer.arm.com/-/media/Files/downloads/gnu/14.3.rel1/binrel/arm-gnu-toolchain-14.3.rel1-x86_64-arm-none-eabi.tar.xz

tar -xz vendor/arm.tar.xz

export PATH="$PATH:vendor/arm-gnu-toolchain-14.3.rel1-x86_64-arm-none-eabi/bin"
