#include "cpu2.h"
#include "tl.h"

/**
 * @brief This function initializes and releases the CPU2 subsystem
 * @param None
 * @retval None
 */
void CPU2_Init() {
  TL_MM_Config_t tl_mm_config;
  SHCI_TL_HciInitConf_t SHci_Tl_Init_Conf;
  
  /**< Reference table initialization */
  TL_Init();
  
  /**< System channel initialization */
  SHci_Tl_Init_Conf.p_cmdbuffer = (uint8_t*)&SystemCmdBuffer;
  SHci_Tl_Init_Conf.StatusNotCallBack = SYS_StatusNotificationCallback;
  shci_init(SYS_UserEventReceivedCallback, (void*) &SHci_Tl_Init_Conf);
  
  /**< Memory Manager channel initialization */
  tl_mm_config.p_AsynchEvtPool = EvtPool;
  tl_mm_config.p_BleSpareEvtBuffer = BleSpareEvtBuffer; /* UNUSED, but kept for future compatibility */
  tl_mm_config.p_SystemSpareEvtBuffer = SystemSpareEvtBuffer; /* UNUSED, but kept for future compatibility, but used by FUS today only */
  tl_mm_config.AsynchEvtPoolSize = EVENT_POOL_SIZE;
  TL_MM_Init( &tl_mm_config );
  
  /**< Release the CPU2 */
  TL_Enable();
}
