/* eslint-disable import/no-anonymous-default-export */
const fetchMe = async (monday) => {
  return new Promise((resolve, reject) => {
    monday.api(`
      query { 
        me { 
          name,
          email
        }
      }`
    )
      .then(res => {
        console.log('[Boards]', res)
        resolve(res)
      })
      .catch(error => {
        console.log('[Boards]', error)
        reject(error)
      })
  })
}

const fetchBoards = async (monday) => {
  return new Promise((resolve, reject) => {
    monday.api(`
      query { 
        boards { 
          id, 
          name,
          columns {
            title,
            type,
            pos,
            width,
            description
          }
          items (limit:100) {
            id
            name
            column_values {
              text
            }
          }
        }
      }`
    )
      .then(res => {
        console.log('[Boards]', res)
        resolve(res)
      })
      .catch(error => {
        console.log('[Boards]', error)
        reject(error)
      })
  })
}

export default {
  fetchMe,
  fetchBoards
}
