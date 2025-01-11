import React, {useState, useEffect, useCallback} from 'react';
import { useNavigate, Link } from 'react-router-dom'
import { FiPower, FiEdit, FiTrash2 } from 'react-icons/fi';

import './styles.css';

import api from '../../services/api'

import logoImage from '../../assets/logo.svg'

export default function Books(){
    
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const username = localStorage.getItem('username');
    const accessToken = localStorage.getItem('accessToken');

    const navigate = useNavigate();

    // Função para deslogar 
    async function logout(){
        localStorage.clear();
        navigate('/')
    }

    // Função para carregar mais livros
    const fetchMoreBooks = useCallback(async () => {
        if (!hasMore) return;

        try {
            const response = await api.get('api/book/v1', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                params: {
                    page: page,
                    size: 2,
                    direction: 'asc'
                }
            });
            const newBooks = response.data?._embedded?.bookVOList || [];
            
            // Atualiza o estado dos livros e verifica se há mais itens
            setBooks(prevBooks => [...prevBooks, ...newBooks]);
            setHasMore(newBooks.length > 0); // Se não há novos itens, marca como fim
        } catch (err) {
            console.error('Error fetching books:', err);
        }
    }, [accessToken, page, hasMore]);

    // Carrega os livros ao montar o componente
    useEffect(() => {
        fetchMoreBooks();
    }, [fetchMoreBooks]);

     // Função para editar um livro
    async function editBook(id){
        try{
            navigate(`/book/new/${id}`)
        } catch (err) {
            alert('Edit failed! Try again.')
        }
    }
    
    // Função para deletar um livro
    async function deleteBook(id){
        try{
            await api.delete(`api/book/v1/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            // Atualiza a lista de livros após a exclusão
            setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
        } catch (err) {
            alert('Delete failed! Try again.')
        }
    }

    // Função para carregar mais livros ao clicar em "Load More"
    const loadMore = () => {
        setPage(prevPage => prevPage + 1);
    };
    
    return (
        <div className="book-container">
            <header>
                <img src={logoImage} alt="Logo" />
                <span>Welcome, <strong>{username.toUpperCase()}</strong>!</span>
                <Link className='button' to="/book/new/0">Add New Book</Link>
                <button onClick={logout} type='button'>
                    <FiPower size={18} color='#251FC5'/>
                </button>
            </header>

            <h1>Registered Books</h1>
            <ul>
                {books.map(book => (
                    <li key={book.id}>
                        <strong>Title:</strong>
                        <p>{book.title}</p>
                        <strong>Author:</strong>
                        <p>{book.author}</p>
                        <strong>Price:</strong>
                        <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(book.price)}</p>
                        <strong>Release Date:</strong>
                        <p>{Intl.DateTimeFormat('pt-BR').format(new Date(book.launchDate))}</p>
                        
                        <button onClick={() => editBook(book.id)} type='button'>
                            <FiEdit size={20} color='#251FC5'/>
                        </button>

                        <button onClick={() => deleteBook(book.id)} type='button'>
                            <FiTrash2 size={20} color='#251FC5'/>
                        </button>
                    </li>
                ))}
            </ul>

            {hasMore ? (
                <button className='button' type='button' onClick={loadMore}>Load More</button>
            ) : (
                <p className='tag-msg'>No more books to load.</p>
            )}
        </div>

    );
}