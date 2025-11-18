import { useState } from 'react';

export default function Modal() {
    return (
        <div className='fixed top-1/2 left-1/2 w-[450px] h-[650px] rounded-3xl -translate-x-1/2 -translate-y-1/2 
        shadow-xl bg-transparent border-white backdrop-filter-[20px] flex justify-center items-center overflow-hidden text-center'>
            {/*Botão de Fechar o Modal*/}
            <button className='bg-[#FF0000] text-white text-xl 
                rounded-tr-3xl rounded-bl-3xl bg-[#232448] w-[40px] h-[40px] 
                top-0 right-0 absolute before:content-[""] before:absolute before:top-1/2 before:left-1/2
                before:-translate-x-1/2 before:-translate-y-1/2 before:w-[15px]
                before:h-[4px] before:bg-white before:rotate-45 before:rounded
                after:content-[""] after:absolute after:top-1/2 after:left-1/2 
                after:-translate-x-1/2 after:-translate-y-1/2 after:w-[15px] 
                after:h-[4px] after:bg-white after:-rotate-45 after:rounded'
            >
            </button>

            {/*Box de adicionar filme*/}
            <div className='w-[100%] h-[650px] pl-[40px] pt-[40px] pr-[40px] pb-[40px]'>
                {/*Parte resposável pela busca */}
                <div>
                    <h2 className='text-4xl pt-[20px] pb-[60px] font-bold text-[#FF0000] uppercase'>
                        Filmes
                    </h2>
                    <form action='#' className='h-[450px] flex-col justify-between items-center'>
                        <div className='w-[3.75rem] h-[3.75rem] relative'>
                            <input className='w-[100%] h-[100%] shadow-xl rounded-3xl' type="search" name="lupa" id="lupa" required/>
                            
                            <label
                                htmlFor="lupa"
                                className='absolute w-[40px] h-[40px] rounded-full top-1/2 left-1/2 
                                    -translate-x-1/2 -translate-y-1/2 

                                    after:content-[""] after:absolute after:top-1/2 after:left-1/2
                                    after:-translate-x-1/2 after:-translate-y-1/2
                                    after:w-[15px] after:h-[15px]
                                    after:rounded-full after:border-2 after:border-[#FF0000]

                                    before:content-[""] before:absolute 
                                    before:top-[65%] before:left-[65%]
                                    before:w-[8px] before:h-[2px] before:rounded-3xl
                                    before:bg-[#FF0000] before:rotate-[40deg]
                                '
                            ></label>

                        </div> 
                        <input className='w-[300px] h-[50px] bg-[#FF0000] text-white shadow-xl rounded-3xl cursor-pointer mt-[80px]' type="button" value="Buscar"/>
                    </form>
                </div>

                {/*Parte no caso de sucesso na busca*/}
                <div className=' h-[650px] top-[650px] absolute'>
                    <div className=''></div>
                    <h2>Titulo</h2>
                    <p>descrição do filme</p>
                    <p>diretor</p>
                    <p>ano</p>
                    <p>genero</p>
                    <p>duração</p>
                    <div className=''>
                        <input type="button" value="Adicionar" />
                    </div>
                </div>

                {/*Parte no caso de erro na busca*/}
                <div className=' h-[650px] top-[-650px] absolute'>
                    <h2>Error</h2>
                    <p>Filme não encontrado</p>
                </div>
            </div>
        </div>
    );
}

/*
Criar Modal que aparece quando o usuário clica em adicionar um filme, onde ele
pode digitar o nome de um filme (talvez aparecer opções que correspondem ao oq
ele digitou e ele pode escolher um desses) quando um filme é escolhido o modal
fecha e o filme aparece na tela principal (já tem lógica de excluir um filme 
selecionado)
*/