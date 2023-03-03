import React, { useRef } from 'react'
import mondaySdk from 'monday-sdk-js'
import { useState, useEffect } from 'react'
import { Button, Loader } from 'monday-ui-react-core'

import ApiHelper from './helpers/api'
import MondayHelper from './helpers/monday'

import './App.css'
import 'monday-ui-react-core/dist/main.css'

const monday = mondaySdk()

const App = () => {
  const inputFile = useRef(null)
  const [user, setUser] = useState({})
  const [boards, setBoards] = useState([])
  const [context, setContext] = useState({})

  const [userFetched, setUserFetched] = useState(false)
  const [boardsFetched, setBoardsFetched] = useState(false)
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const [generateInProgress, setGenerateInProgress] = useState(false)

  useEffect(() => {
    monday.execute('valueCreatedForUser')

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen('context', (res) => {
      setContext(res.data)
    })

    monday.listen('settings', (res) => {
      this.setState({ settings: res.data })
    })

    MondayHelper.fetchBoards(monday)
      .then(res => {
        setBoardsFetched(true)
        setBoards(res?.data?.boards)
      })
      .catch(err =>  {
        setBoardsFetched(false)
        monday.execute('notice', { 
          type: 'error',
          timeout: 10000,
          message: err.message || 'Something went wrong!'
        })
        }
      )
    
    MondayHelper.fetchMe(monday)
      .then(res => {
        setUserFetched(true)
        setUser(res?.data?.me)
      })
      .catch(err =>  {
        setUserFetched(false)
        monday.execute('notice', { 
          type: 'error',
          timeout: 10000,
          message: err.message || 'Something went wrong!'
        })
        }
      )
  }, [])

  const generate = async () => {
    const accountId = context?.account?.id
    if (!accountId) {
      monday.execute('notice', { 
        message: 'Account not found!',
        type: 'error',
        timeout: 10000,
      })
      return
    }

    if (!boards || boards.length < 1) {
      monday.execute('notice', { 
        message: 'No boards found!',
        type: 'error',
        timeout: 10000,
      })
      return
    }

    const formData = new FormData()
    formData.append('accountId', accountId.toString())
    formData.append('boards', boards)
    formData.append('email', user?.email)

    setGenerateInProgress(true)
    const { success, data, error } = await ApiHelper.generateDocument({
      accountId: accountId.toString(),
      boards,
      email: user?.email
    })
    if (success) {
      setGenerateInProgress(false)
      console.log('[Generate Document] Reponse:', data)
      monday.execute('notice', { 
        message: 'Document Generated Succesfully!',
        type: 'success',
        timeout: 10000,
      })
    } else {
      setGenerateInProgress(false)
      console.log('[Generate Document] Error:', error)
      monday.execute('notice', { 
        message: error,
        type: 'error',
        timeout: 10000,
      })
    }
  }

  const onFileChange = async (e) => {
    const accountId = context?.account?.id
    if (!accountId) {
      monday.execute('notice', { 
        message: 'Account not found!',
        type: 'error',
        timeout: 10000,
      })
      return
    }

    const formData = new FormData()
    formData.append('accountId', accountId)
    formData.append('file', e.target.files[0])

    setUploadInProgress(true)
    const { success, data, error } = await ApiHelper.uploadTemplate(formData)
    if (success) {
      setUploadInProgress(false)
      console.log('[Upload Template] Reponse:', data)
      monday.execute('notice', { 
        message: 'Template successfully uploaded!',
        type: 'success',
        timeout: 10000,
      })
    } else {
      setUploadInProgress(false)
      console.log('[Upload Template] Error:', error)
      monday.execute('notice', { 
        message: error,
        type: 'error',
        timeout: 10000,
      })
    }
  }

  console.log('Me:', user)
  console.log('Boards:', boards)
  console.log('Contexts:', context)
  return (
    <div className='App'>
      {/* Upload Button */}
      <Button onClick={() => inputFile.current.click()}>
        { uploadInProgress ? <Loader size={25} /> : <>Upload</> }
      </Button>
      {/* Hidden Input Field */}
      <input
        type='file'
        ref={inputFile}
        disabled={!boardsFetched || !userFetched}
        onChange={onFileChange} />

      <Button onClick={() => generate()}>
        { generateInProgress ? <Loader size={25} /> : <>Generate Document</> }
      </Button>
    </div>
  )
}

export default App
