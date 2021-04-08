import sketch from 'sketch'
import setApiKey from './set-api-key'
var axios = require('axios');
// const httpClient = axios.create();
// httpClient.defaults.timeout = 50000;

function getApiKey() {
  const apiKey = sketch.Settings.settingForKey('api-key')

  
  if (!apiKey) {
    return setApiKey().catch(() => {})
  } else {
    return Promise.resolve(apiKey)
  }
}

 function removeBackground(objectWithImage, apiKey) {
  sketch.UI.message('Removing background...')

  const data = objectWithImage.image.nsdata

  const formData = new FormData();
  formData.append(
    'source_image_file', {
    fileName: 'image.jpg',
    mimeType: 'image/jpg', // or whichever mime type is your file
    data: data
  });
  // formData.append('output_image_format','binary')
  

  return fetch('https://api.slazzer.com/v2.0/remove_image_background', {
    method: 'POST',
    headers: {
      'API-KEY': apiKey
    },
    body: formData
  }).then(res => {
    
     
    if (!res.ok) {
      console.log('!! Issues with API response :(')

      
      return res.text().then(text => {
        let message = text
        try {
          const json = JSON.parse(message)

          if (json && json.error) {
            message = json.error
            console.log(message)
            // sketch.UI.message(message)
          }
        } catch (err) {}
        throw new Error(message)
      })
    } 
    return res.blob()

   }) 
 
  .then(response => {
   console.log(response)
    objectWithImage.image = response

  //   response.text().then(text => {
  //     let message = text
      
  //     try {
  //       const json = JSON.parse(message)
  //       let img = json.output_image_url
  //       console.log(url)
  //       sketch.UI.message(url)

  //       objectWithImage.image = image
        
        

        
  // .catch((err) => console.error(err))

  //     } catch (err) {}
      

  //   })
 
    
  })
  .catch(err => {
    console.error(err)
    sketch.UI.message(`Error: ${err.message}`)



  })
}

 function changeImage(url, objectWithImage) {
  console.log('In Change Image >>>>')
  console.log(url)
   
   
  axios
  .get(url, {
    responseType: 'arraybuffer'
  })
  .then(response => Buffer.from(response.data, 'binary').toString('base64'))
     
 
      // console.log(image)
      // console.log('---IMAGE----')
      // objectWithImage.image = image
}
export default function() {
  const document = sketch.getSelectedDocument()
  if (!document) {
    return
  }
  const selection = document.selectedLayers
  if (!selection.length) {
    console.log('log>>')
    sketch.UI.message('Please select an image first')
    return
  }

  getApiKey().then(apiKey => {
    if (!apiKey) {
      sketch.UI.message('Please enter your Slazzer API key first')
      return
    }
    selection.forEach(layer => {
      if (layer.type === 'Image') {
        return removeBackground(layer, apiKey)
      }
      if (layer.style && layer.style.fills.length) {
        layer.style.fills.forEach(fill => {
          if (fill.fill === 'Pattern' && fill.pattern && fill.pattern.patternType === 'Fill') {
            return removeBackground(fill.pattern, apiKey)
          }
        })
      }
    })
  })
}


