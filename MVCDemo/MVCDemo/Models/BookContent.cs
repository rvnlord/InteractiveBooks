using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace MVCDemo.Models
{
    public class BookContent : IEnumerable
    {
        private readonly List<BookContentPart> _bookContent;

        public int Count => _bookContent.Count;

        public BookContentPart this[int index]
        {
            get
            {
                return _bookContent.Single(x => x.Id == index);
            }
            set
            {
                _bookContent[_bookContent.IndexOf(_bookContent.Single(x => x.Id == index))] = value;
            }
        }

        public void Add(BookContentPart part)
        {
            _bookContent.Add(part);
        }

        public void Remove(BookContentPart part)
        {
            _bookContent.Add(part);
        }

        public BookContent()
        {
            _bookContent = new List<BookContentPart>();
        }
        
        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public BookContentEnumerator GetEnumerator()
        {
            return new BookContentEnumerator(_bookContent);
        }
    }

    public class BookContentPart
    {
        public int Id { get; set; }
        public List<BookContentPart> Parents { get; set; }
        public List<int> ParentIds { get; set; }
        public List<BookContentPart> Children { get; set; }
        public List<int> ChildrenIds { get; set; }
        public string Choice { get; set; }
        public Chapter Chapter { get; set; }
        public string Story { get; set; }
        public string Description { get; set; }
    }

    public struct Chapter
    {
        public int Number { get; set; }
        public string Title { get; set; }
    }

    public class BookContentEnumerator : IEnumerator
    {
        private readonly List<BookContentPart> _bookContent;
        private int _position = -1;

        public BookContentPart Current
        {
            get
            {
                try
                {
                    return _bookContent[_position];
                }
                catch (IndexOutOfRangeException)
                {
                    throw new InvalidOperationException();
                }
            }
        }

        object IEnumerator.Current => Current;

        public BookContentEnumerator(List<BookContentPart> bookContent)
        {
            _bookContent = bookContent;
        }
        
        public bool MoveNext()
        {
            _position++;
            return _position < _bookContent.Count;
        }

        public void Reset()
        {
            _position = -1;
        }
    }
}
