#include "ring.h"

int8_t ring_init(ring_buffer_t *self, uint8_t *im_addr, const uint32_t size) {
    if (!self) {
        return RB_REQUIREMENTS;
    }

    self->data = im_addr;
    self->size = size;
    self->read_ptr = 0;
    self->write_ptr = 1;

    return RB_SUCCESS;
}

int8_t ring_write(ring_buffer_t *self, uint8_t byte){
    if (!self){
        return RB_REQUIREMENTS;
    }

    if (((self->write_ptr + 1) % NPERSEG) == self->read_ptr) {
        return RB_OVERRUN;
    }

    self-> data[self->write_ptr] = byte;
    self->write_ptr = (self->write_ptr + 1) % NPERSEG;

    return RB_SUCCESS;
}

uint8_t ring_read(ring_buffer_t *self) {
    if (!self) {
        return 0;
    } else if (self->write_ptr == self->read_ptr) {
        return 0;
    }

    self->read_ptr = (self->read_ptr + 1) % NPERSEG;
    uint8_t byte = self->data[self->read_ptr];

    return byte;
}

