# Default project


Это стандартная сборка для быстрого разворачивания проекта на ZURB Foundation 6

Включает в себя следущее:

- Стили: SCSS + PostCSS
- Щаблонизвтор: Pug(Jade)
- CSS фреймворк: ZURB Foundation 6
- Методология CSS: SMACSS
- Таск-менеджер: Gulp
- Менеджер пакетов: Bower, NPM

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

