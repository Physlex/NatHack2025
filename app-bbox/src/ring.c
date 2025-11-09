#include "ring.h"

static uint8_t ring_buffer_data[256];

int8_t ring_init(ring_buffer_t *self) {
    if (!self) {
        return RB_REQUIREMENTS;
    }

    self->data = ring_buffer_data;
    self->read_ptr = 0;
    self->write_ptr = 0;
    return RB_SUCCESS;
}

int8_t ring_write(ring_buffer_t *self, uint8_t byte){
    if (!self){
        return RB_REQUIREMENTS;
    }

    if (((self->write_ptr+1)%256)== self->read_ptr){
        return RB_REQUIREMENTS;
    }
    self-> data[self->write_ptr]=byte;
    self->write_ptr=(self->write_ptr+1)%256;
    return RB_SUCCESS;
}
uint8_t ring_read(ring_buffer_t *self) {
    uint8_t byte = self->data[self->read_ptr];
    self->read_ptr = (self->read_ptr + 1) % 256;
    return byte;
}

