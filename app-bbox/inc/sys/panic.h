#ifndef BBOX_CORE_SYS_PANIC_H_
#define BBOX_CORE_SYS_PANIC_H_

//! @note Executed to alert a known error state.
extern void panic();

//! @note Alias for 'panic'.
static inline void Error_Handler(void) { panic(); };


#endif  // BBOX_CORE_SYS_PANIC_H_
