import { Deck } from './types';

export const decks: Deck[] = [
  [
    {
      _id: '1',
      type: 'quizit',
      body: [
        'What is the capital of France? Imagine if this was a really long question that needed to be wrapped.',
        'What is the capital of Germany? How many words can we fit on this line?',
        'What is the capital of Spain?'
      ]
    },
    {
      _id: '1',
      type: 'explanation',
      insightId: '1',
      title: 'Never Criticize, Condemn, or Complain',
      summary: 'This is the first principle in How to Win Friends and Influence People. It is a good idea to avoid criticizing, condemning, or complaining as it can lead to resentment and negative feelings.',
      explanations: [
        'Paris is in France',
        'Paris is in France',
        'Paris is in France'
      ]
    },
    {
      _id: '2',
      type: 'explanation',
      insightId: '2',
      title: 'Question Defaults',
      summary: 'In Originals, Adam Grant discusses the importance of questioning defaults. This is a good way to encourage creativity and innovation.',
      explanations: [
        'Berlin is in Germany',
        'Berlin is in Germany',
        'Berlin is in Germany'
      ]
    }
  ],
  [
    {
      _id: '2',
      type: 'quizit',
      body: [
        'What is the capital of Italy?',
        'What is the capital of the United Kingdom?',
        'What is the capital of the United States?'
      ]
    },
    {
      _id: '4',
      type: 'explanation',
      insightId: '4',
      title: 'Rome',
      summary: 'Rome is the capital of Italy',
      explanations: [
        'Rome is the capital of Italy',
        'Rome is the capital of Italy',
        'Rome is the capital of Italy'
      ]
    },
    {
      _id: '5',
      type: 'explanation',
      insightId: '5',
      title: 'London',
      summary: 'London is the capital of the United Kingdom',
      explanations: [
        'London is the capital of the United Kingdom',
        'London is the capital of the United Kingdom',
        'London is the capital of the United Kingdom'
      ]
    }
  ], 
  [
    {
      _id: '7',
      type: 'quizit',
      body: [
        'What is the capital of Italy?',
        'What is the capital of the United Kingdom?',
        'What is the capital of the United States?'
      ]
    },
    {
      _id: '8',
      type: 'explanation',
      insightId: '4',
      title: 'Rome',
      summary: 'Rome is the capital of Italy',
      explanations: [
        'Rome is the capital of Italy',
        'Rome is the capital of Italy',
        'Rome is the capital of Italy'
      ]
    },
    {
      _id: '9',
      type: 'explanation',
      insightId: '5',
      title: 'London',
      summary: 'London is the capital of the United Kingdom',
      explanations: [
        'London is the capital of the United Kingdom',
        'London is the capital of the United Kingdom',
        'London is the capital of the United Kingdom'
      ]
    }
  ]
];
