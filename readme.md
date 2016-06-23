# Default project


Это стандартная сборка для быстрого разворачивания проекта

Включает в себя следущее:

- Стили: SCSS + PostCSS
- CSS фреймворк: ZURB Foundation 6
- Методология CSS: SMACSS
- Таск-менеджер: Gulp
- Менеджер пакетов: Bower, NPM
- Шаблонизатор Handlebars c Panini

### Установка

Склонируй репозиторий на комп:

```bash
git clone https://github.com/dimakrivenko/default-project.git
```

Перейди в папку и установи все плагины:

```bash
cd default-project
npm install
bower install или sudo bower install --allow-root
```

Запусти следующими командам:
```bash 
gulp
gulp build
gulp build --production
``` 

