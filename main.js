//получаем
const table = document.querySelector('.table'),
    nav = document.querySelector('.nav'),
    sortName = document.querySelector('.sortName'),
    sortLastname = document.querySelector('.sortLastname'),
    cellsForm = document.querySelector('#form'),
    colorForm = document.querySelector('#colorForm'),
    editDiv = document.querySelector('.editRow'),
    editForm = document.querySelector('#editForm'),
    closeButton = document.querySelector('.close'),
    applyEditButton = document.querySelector('.applyEdit');


//получение данных из файла json
const getData = async function(url){
    const response = await fetch(url);
  
    if(!response.ok){
      throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
    }
  
    return await response.json();
};

let urlDb = './data.json';

window.addEventListener('load', ()=>{
    let data;
    getData(urlDb).then(function(res){
        data = res;
        data.forEach(element => {
                table.tBodies[0].insertAdjacentHTML('beforeend', `
                    <tr class="row">
                        <td class="data data-firstName">${element.name.firstName}</td>
                        <td class="data data-lastName">${element.name.lastName}</td>
                        <td class="data about data-about"><p>${element.about}</p></td>
                        <td class="data data-eyeColor ${element.eyeColor}" style="background-color: ${element.eyeColor}"></td>
                    </tr>
                `); // добавляем строку о человеке из бд      
        });
        
        const createPagination = (length) => {
            nav.innerHTML = "";
            let countPages = Math.ceil((length)/10); //определяем количество страниц
            for(let j = 1; j<=countPages; j++)  nav.insertAdjacentHTML('beforeend', `<a href="#" class="nav_link">${j}</a>`); //добавляем нужное количество ссылок в пагинацию
            
            let links = document.querySelectorAll('.nav_link'); // ссылки пагинации
            links.forEach(el => { //перебираем ссылки
                el.addEventListener('click', (e)=>{ //добавляем на каждую ссылку событие
                    let target = e.target;
                    let rNum = Number(target.innerHTML)*10; // номер последнего элемента который должен отображаться
                    let lNum = rNum - 10; // номер первого элемента который должен ототбражаться
                table.style.cssText = `transform: translate(0px, -${lNum*61}px);`;//двигаем таблицу вверх для достижения необх. эффекта
                    
                })
            });
        }
        createPagination(data.length);
        

        

        const sort = (e, cell) => { // передаем эвент и номер столбца 
            let target = e.target;
            let sortedRows;
            if(target.innerHTML=='▼'){
                target.innerHTML = '▲';
                sortedRows = Array.from(table.rows).slice(1).sort((rowA, rowB) => rowA.cells[cell].innerHTML > rowB.cells[cell].innerHTML ? 1 : -1); // сортируем в алфавитном порядке столбец
            } else{
                target.innerHTML = '▼';
                sortedRows = Array.from(table.rows).slice(1).sort((rowA, rowB) => rowA.cells[cell].innerHTML < rowB.cells[cell].innerHTML ? 1 : -1); // сортируем в алфавитном порядке с конца
            }
            table.append(...sortedRows); // обновляем таблицу
        }

        const cellsHiding = (e) => {
            let target = e.target;
            if(target.tagName == 'SPAN'){
                let input = target.children[0]; //чекбокс 
                input.checked = !input.checked; //инвертируем чекбокс при клике на название столбца рядом

            } else if(target.tagName == 'BUTTON'){
                for(let i=0; i<4; i++){ //перебираем все чекбоксы формы
                    let value = cellsForm.children[i].children[0].name; //столбец за который отвечает чекбокс
                    if(!cellsForm.children[i].children[0].checked){ //если чекбокс без галочки
                        if(!document.querySelector(`.data-nav-${value}`).classList.contains('hide')) document.querySelector(`.data-nav-${value}`).classList.toggle('hide'); //если у инпута нет класс хайд то добавляем его в шапке
                        Array.from(document.querySelectorAll(`.data-${value}`)).forEach(el => {
                            if (!el.classList.contains('hide')) el.classList.toggle('hide'); //и добавляем каждому элементу этого столбца
                        })
                    } else{
                        if(document.querySelector(`.data-nav-${value}`).classList.contains('hide')) document.querySelector(`.data-nav-${value}`).classList.toggle('hide'); //так же если есть галочка и есть класс хайд то мы его убираем в шапке
                        Array.from(document.querySelectorAll(`.data-${value}`)).forEach(el => {
                            if (el.classList.contains('hide')) el.classList.toggle('hide'); //и убираем у каждого элемента столбца 
                        })
                    }
                }
            }
        }

        let activeCount = data.length; // сохраняем текущее количество страниц
        const colorSorting = (e) => {
            let target = e.target;
            let countRows = activeCount; 
            if(target.tagName == 'SPAN'){
                let input = target.children[0]; //чекбокс 
                input.checked = !input.checked; //инвертируем чекбокс при клике на название столбца рядом

            } else if(target.tagName == 'BUTTON'){
                for(let i=0; i<4; i++){ //перебираем все чекбоксы формы
                    let value = colorForm.children[i].children[0].name; //столбец за который отвечает чекбокс
                    if(!colorForm.children[i].children[0].checked){ //если чекбокс без галочки
                        
                        Array.from(document.querySelectorAll(`.${value}`)).forEach(el => {
                            if (!el.parentNode.classList.contains('hide')){ 
                                el.parentNode.classList.toggle('hide');//добавляем класс hide строки
                                countRows--; //уменьшаем количество страниц
                            } 
                        });
                    } else{
                        
                        Array.from(document.querySelectorAll(`.${value}`)).forEach(el => {
                            if (el.parentNode.classList.contains('hide')) { 
                                el.parentNode.classList.toggle('hide'); //убираем класс hide у строки
                                countRows++; //увеличиваем кол-во страниц
                            }
                        });
                    }
                }
                createPagination(countRows); //обновляем пагинацию
                activeCount = countRows; // обновляем текущее количество страниц
            }
        }


        let n,row;
        Array.from(document.querySelectorAll('.row')).forEach(el => { //перебираем каждую строку таблицы
            el.addEventListener('click', e=> { //на каждую строку навешиваем событие клика
                row=el; // запоминаем строку
                if(editDiv.classList.contains('hide')) editDiv.classList.toggle('hide'); //если форма редактирования не включена, то включаем
                editDiv.querySelector('.editName').value = el.children[0].innerHTML; //В поле редактирования имени вводим текущее Имя из строки
                n= el.children[0].innerHTML;// тк имена в db уникальны и не повторяются, то запоминаем имя
                editDiv.querySelector('.editLastName').value = el.children[1].innerHTML;//В поле редактирования фамилии вводим текущую Фамилию из строки
                editDiv.querySelector('.editAbout').value = el.children[2].children[0].innerHTML; // В поле редактирования описания вводим текущее Описание из строки
                Array.from(editForm.querySelectorAll('option')).forEach(element => { //перебираем все варианты цвета в select
                    if(el.children[3].style.backgroundColor == element.value) element.selected = true; //если цвет глаз из строки равен значению цвета глаз из select то ставим его по ум.
                    else element.selected = false; //иначе убираем св-во selected
                    
                })
                
                
            })
        })
        
        applyEditButton.addEventListener('click', e => { //событие кнопки применить изменения формы редактирования
            editDiv.classList.toggle('hide'); //скрываем форму по завершении работы
            data.forEach(el => { //перебираем людей из db
                if(el.name.firstName == n){ //из запомненного имени находим человека в db
                    el.name.firstName = editDiv.querySelector('.editName').value; // меняем имя в db
                    row.children[0].innerHTML = editDiv.querySelector('.editName').value;// меняем имя на странице
                    el.name.lastName = editDiv.querySelector('.editLastName').value; //меняем фамилию в db
                    row.children[1].innerHTML = editDiv.querySelector('.editLastName').value; //меняем фамилию на странице
                    el.about =  editDiv.querySelector('.editAbout').value; // меняем описание в db
                    row.children[2].children[0].innerHTML =  editDiv.querySelector('.editAbout').value; //меняем описание на странице
                    el.eyeColor = editDiv.querySelector('select').value; //меняем цвет глаз в db
                    row.children[3].style.cssText = `background-color: ${editDiv.querySelector('select').value}`;
                }
            })
        })

        closeButton.addEventListener('click', e => editDiv.classList.toggle('hide')); //скрываем форму редактирования по нажатию на кнопку "Закрыть"
        sortName.addEventListener('click', (e) => sort(e,0) ); //событие сортировки при клике на треугольник рядом с "Имя"
        sortLastname.addEventListener('click', (e) => sort(e,1) ); //событие сортировки при клике на треугольник рядом с "Фамилия"
        cellsForm.addEventListener('click', (e) => cellsHiding(e)); //событие клика по форме отображения столбцов 
        colorForm.addEventListener('click', e => colorSorting(e)); //







    });
    
});

