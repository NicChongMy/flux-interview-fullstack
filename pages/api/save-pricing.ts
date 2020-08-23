import * as Joi from '@hapi/joi'

import fs from 'fs';

// This is the JOI validation schema, you define
// all the validation logic in here, then run
// the validation during the request lifecycle.
// If you prefer to use your own way of validating the 
// incoming data, you can use it.
const schema = Joi.object<import('../../types').Matrix>({
  '36months': Joi.object().keys({ 'lite': Joi.number().required(), 'standard': Joi.number().required(), 'unlimited': Joi.number().required() }).required(),
  '24months': Joi.object().keys({ 'lite': Joi.number().required(), 'standard': Joi.number().required(), 'unlimited': Joi.number().required() }).required(),
  '12months': Joi.object().keys({ 'lite': Joi.number().required(), 'standard': Joi.number().required(), 'unlimited': Joi.number().required() }).required()
})

export default async (req: import('next').NextApiRequest, res: import('next').NextApiResponse) => {
  try {
    // This will throw when the validation fails
    console.log('req.body', req.body)
    const data = await schema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    }) as import('../../types').Matrix

    //Save json data into public/pricing.json
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFile('public/pricing.json', jsonData, finished);

    res.statusCode = 200
    res.json(data)
  } catch (e) {
    console.error(e)
    if (e.isJoi) {
      // Handle the validation error and return a proper response
      res.statusCode = 422
      res.end('Error')
      return
    }

    res.statusCode = 500
    res.json({ error: 'Unknown Error' })
  }
}

function finished(err) {
  console.log('write file done');
}