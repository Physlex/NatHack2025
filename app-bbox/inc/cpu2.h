#ifndef BBOX_CORE_CPU2_H_
#define BBOX_CORE_CPU2_H_

#define RAM_BASE 0x20000000
#define RAM_BB_BASE 0x22000000

//! @note CPU2 Macros

#define VariableBit_Reset_BB(VariableAddress, BitNumber) \
(*(volatile uint32_t *) (RAM_BB_BASE | ((VariableAddress - RAM_BASE) << 5) | ((BitNumber) << 2)) = 0)
#define VariableBit_Set_BB(VariableAddress, BitNumber) \
(*(volatile uint32_t *) (RAM_BB_BASE | ((VariableAddress - RAM_BASE) << 5) | ((BitNumber) << 2)) = 1)
#define VariableBit_Get_BB(VariableAddress, BitNumber) \
(*(volatile uint32_t *) (RAM_BB_BASE | ((VariableAddress - RAM_BASE) << 5) | ((BitNumber) << 2)))


#define CPU2_BB_FLAG_GET(state, flag) VariableBit_Get_BB(((uint32_t)&state), flag)
#define CPU2_BB_FLAG_SET(state, flag) VariableBit_Set_BB(((uint32_t)&state), flag)
#define CPU2_BB_FLAG_RESET(state, flag) VariableBit_Reset_BB(((uint32_t)&state), flag)


extern void CPU2_Init();


#endif  // BBOX_CORE_CPU2_H_
