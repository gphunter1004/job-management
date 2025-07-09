import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { updateRobotState, updateRobotHealth, addRobot, removeRobot } from '@/store/slices/robotSlice'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export const useWebSocket = () => {
  const dispatch = useAppDispatch()
  const { token, isAuthenticated } = useAppSelector(state => state.auth)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (!isAuthenticated || !token || socketRef.current?.connected) {
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
    
    console.log('Connecting to WebSocket:', wsUrl)

    socketRef.current = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      upgrade: false,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      toast.success('Real-time connection established')
    })

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      setIsConnected(false)
      if (reason !== 'io client disconnect') {
        toast.error('Real-time connection lost')
      }
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
      toast.error('Failed to establish real-time connection')
    })

    // Robot state updates
    socket.on('robot_state_update', (data) => {
      console.log('Robot state update:', data)
      dispatch(updateRobotState({
        serialNumber: data.serialNumber,
        state: data.state
      }))
      setLastMessage({
        type: 'robot_state_update',
        data,
        timestamp: new Date().toISOString()
      })
    })

    // Robot health updates
    socket.on('robot_health_update', (data) => {
      console.log('Robot health update:', data)
      dispatch(updateRobotHealth({
        serialNumber: data.serialNumber,
        health: data.health
      }))
      setLastMessage({
        type: 'robot_health_update',
        data,
        timestamp: new Date().toISOString()
      })
    })

    // Robot connection events
    socket.on('robot_connected', (data) => {
      console.log('Robot connected:', data)
      dispatch(addRobot(data.serialNumber))
      toast.success(`Robot ${data.serialNumber} connected`)
      setLastMessage({
        type: 'robot_connected',
        data,
        timestamp: new Date().toISOString()
      })
    })

    socket.on('robot_disconnected', (data) => {
      console.log('Robot disconnected:', data)
      dispatch(removeRobot(data.serialNumber))
      toast.error(`Robot ${data.serialNumber} disconnected`)
      setLastMessage({
        type: 'robot_disconnected',
        data,
        timestamp: new Date().toISOString()
      })
    })

    // Order updates
    socket.on('order_update', (data) => {
      console.log('Order update:', data)
      toast.info(`Order ${data.orderId} status: ${data.status}`)
      setLastMessage({
        type: 'order_update',
        data,
        timestamp: new Date().toISOString()
      })
    })

    // System alerts
    socket.on('system_alert', (data) => {
      console.log('System alert:', data)
      switch (data.severity) {
        case 'error':
          toast.error(data.message)
          break
        case 'warning':
          toast.error(data.message, { icon: '⚠️' })
          break
        case 'info':
          toast.success(data.message)
          break
        default:
          toast(data.message)
      }
      setLastMessage({
        type: 'system_alert',
        data,
        timestamp: new Date().toISOString()
      })
    })

    // Battery alerts
    socket.on('battery_alert', (data) => {
      console.log('Battery alert:', data)
      toast.error(`Low battery alert: Robot ${data.serialNumber} (${data.batteryLevel}%)`, {
        icon: '🔋',
        duration: 6000
      })
      setLastMessage({
        type: 'battery_alert',
        data,
        timestamp: new Date().toISOString()
      })
    })

    // Error alerts
    socket.on('error_alert', (data) => {
      console.log('Error alert:', data)
      toast.error(`Robot ${data.serialNumber}: ${data.message}`, {
        icon: '❌',
        duration: 8000
      })
      setLastMessage({
        type: 'error_alert',
        data,
        timestamp: new Date().toISOString()
      })
    })

  }, [token, isAuthenticated, dispatch])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket')
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data)
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }, [])

  // Subscribe to specific robot updates
  const subscribeToRobot = useCallback((serialNumber: string) => {
    sendMessage('subscribe_robot', { serialNumber })
  }, [sendMessage])

  const unsubscribeFromRobot = useCallback((serialNumber: string) => {
    sendMessage('unsubscribe_robot', { serialNumber })
  }, [sendMessage])

  // Request immediate robot state
  const requestRobotState = useCallback((serialNumber: string) => {
    sendMessage('get_robot_state', { serialNumber })
  }, [sendMessage])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    subscribeToRobot,
    unsubscribeFromRobot,
    requestRobotState,
  }
}