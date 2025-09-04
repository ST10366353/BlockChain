import React from 'react';
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAPIDocs } from '@/lib/api-documentation';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { format = 'json' } = req.query;

  try {
    switch (format) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(JSON.parse(generateAPIDocs('json')));
        break;

      case 'html':
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(generateAPIDocs('html'));
        break;

      case 'postman':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="did-blockchain-api.postman_collection.json"');
        res.status(200).json(generateAPIDocs('postman'));
        break;

      case 'yaml':
        res.setHeader('Content-Type', 'application/x-yaml');
        res.setHeader('Content-Disposition', 'attachment; filename="did-blockchain-api.yaml"');
        res.status(200).send(generateAPIDocs('yaml'));
        break;

      default:
        res.status(400).json({
          error: 'Invalid format',
          supportedFormats: ['json', 'html', 'yaml', 'postman']
        });
    }
  } catch (error) {
    console.error('API documentation generation error:', error);
    res.status(500).json({
      error: 'Failed to generate API documentation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
