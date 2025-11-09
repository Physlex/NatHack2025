#ifndef BBOX_CORE_CPU2_H_
#define BBOX_CORE_CPU2_H_

#include "tl.h"
#include "shci.h"
#include "shci_tl.h"

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


/**
 * @brief This function initializes and releases the CPU2 subsystem
 * @param None
 * @retval None
 */
extern void CPU2_Init();

/**
* @brief As stated in AN5289, this is the system event user callback. It is
*        registered and passed as argument to shci_init() function.
*        This reports the received system user event.
*        The buffer holding the received event is freed on return
*        of this function.
* @param pData: pointer to a structure of tSHCI_UserEvtRxParam type
*
*               typedef struct
*               {
*                 SHCI_TL_UserEventFlowStatus_t status;
*                 TL_EvtPacket_t *pckt;
*               } tSHCI_UserEvtRxParam;
*
*               pckt: holds the address of the received event
*               status: provides a way for user to notify the system transport layer that the received packet
*                       has not been processed and must not be thrown away. When not filled by the user on return
*                       of UserEvtRx(), this parameter is set to SHCI_TL_UserEventFlow_Enable, which means the
*                       user has processed the received event
* @retval None
*/
static void SYS_UserEventReceivedCallback(void * pData);

/**
* @brief As stated in AN5289, this is the callback used to acknowledge
*        if a system command can be sent. It is registered in shci_init()
*        It must be used in a multi-thread application where the system commands
*        may be sent from different threads.
*
*        switch (status)
*        {
*        case SHCI_TL_CmdBusy:
*          break;
*        case SHCI_TL_CmdAvailable:
*          break;
*        default:
*          break;
*
* @param status: SHCI_TL_CmdBusy in case the system transport layer is busy and no
*                new system command are be sent, SHCI_TL_CmdAvailable otherwise
* @retval None
*/
static void SYS_StatusNotificationCallback(SHCI_TL_CmdStatus_t status);


#endif  // BBOX_CORE_CPU2_H_
