#include "cpu2.h"
#include "app_conf.h"
#include "tl.h"
#include "shci.h"
#include "shci_tl.h"
#include "main.h"

static void SYS_UserEventReceivedCallback(void * pData);
static void SYS_StatusNotificationCallback(SHCI_TL_CmdStatus_t status);
#define TL_BLE_EVENT_FRAME_SIZE ( TL_EVT_HDR_SIZE + CFG_TLBLE_MOST_EVENT_PAYLOAD_SIZE )
#define EVENT_POOL_SIZE                    (CFG_TLBLE_EVT_QUEUE_LENGTH*4U*DIVC(( sizeof(TL_PacketHeader_t) + TL_BLE_EVENT_FRAME_SIZE ), 4U))
PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static uint8_t EvtPool[EVENT_POOL_SIZE];
PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static TL_CmdPacket_t SystemCmdBuffer;
PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static TL_CmdPacket_t BleCmdBuffer;
PLACE_IN_SECTION("MB_MEM1") ALIGN(4) static uint8_t SystemSpareEvtBuffer[sizeof(TL_PacketHeader_t) + TL_EVT_HDR_SIZE + 255];
PLACE_IN_SECTION("MB_MEM2") ALIGN(4) static uint8_t BleSpareEvtBuffer[sizeof(TL_PacketHeader_t) + TL_EVT_HDR_SIZE + 255];

/**
 * @brief This function initializes and releases the CPU2 subsystem
 * @param None
 * @retval None
 */
void CPU2_Init() {
  TL_MM_Config_t tl_mm_config;
  SHCI_TL_HciInitConf_t SHci_Tl_Init_Conf;
  /* uint8_t SystemCmdBuffer[1024]; */

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
static void SYS_UserEventReceivedCallback( void * pData )
{
  TL_AsynchEvt_t *p_sys_event;
  SHCI_C2_Ready_Evt_t *p_sys_ready_event;
  SCHI_SystemErrCode_t *p_sys_error_code;

  p_sys_event = (TL_AsynchEvt_t*)(((tSHCI_UserEvtRxParam*)pData)->pckt->evtserial.evt.payload);

  /* We have received some event from CPU2, so CPU2 to be considered as running and responding */
  APP_FLAG_SET(APP_FLAG_CPU2_INITIALIZED);

  switch(p_sys_event->subevtcode)
  {
  case SHCI_SUB_EVT_CODE_READY:
    p_sys_ready_event = (SHCI_C2_Ready_Evt_t*)p_sys_event->payload;
    if (p_sys_ready_event->sysevt_ready_rsp == WIRELESS_FW_RUNNING)
    {
      APP_FLAG_RESET(APP_FLAG_FUS_FW_RUNNING);
      APP_FLAG_SET(APP_FLAG_WIRELESS_FW_RUNNING);
      /* RF stack installed and ready */
    }
    else if (p_sys_ready_event->sysevt_ready_rsp == FUS_FW_RUNNING)
    {
      APP_FLAG_SET(APP_FLAG_FUS_FW_RUNNING);
      APP_FLAG_RESET(APP_FLAG_WIRELESS_FW_RUNNING);

      ((tSHCI_UserEvtRxParam *)pData)->status = SHCI_TL_UserEventFlow_Disable;

      /* No RF stack installed most probably */
      Error_Handler(); /* UNEXPECTED */
    }
    else {
      APP_FLAG_SET(APP_FLAG_CPU2_ERROR);
      Error_Handler(); /* UNEXPECTED */
    }
    break; /* SHCI_SUB_EVT_CODE_READY */
  case SHCI_SUB_EVT_ERROR_NOTIF:
    APP_FLAG_SET(APP_FLAG_CPU2_ERROR);

    p_sys_error_code = (SCHI_SystemErrCode_t*)p_sys_event->payload;
    if (p_sys_error_code == ERR_BLE_INIT)
    {
      /* Error during BLE stack initialization */
      APP_FLAG_SET(APP_FLAG_BLE_INITIALIZATION_ERROR);
      Error_Handler(); /* UNEXPECTED */
    }
    else {
      Error_Handler(); /* UNEXPECTED */
    }
    break; /* SHCI_SUB_EVT_ERROR_NOTIF */
  default:
    break;
  }

  return;
}
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
static void SYS_StatusNotificationCallback( SHCI_TL_CmdStatus_t status )
{
  /* Callback not implemented - code flow under control of the developer */
  UNUSED(status);
  return;
}
