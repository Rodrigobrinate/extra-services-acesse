document.addEventListener('DOMContentLoaded', () => {

    // --- DADOS DE EXEMPLO (Simulando o que viria do seu Backend) ---
    let services = [
        { id: 1, title: 'Limpeza de Estofado', extra_service_group_id: null },
        { id: 2, title: 'Higienização de Ar Condicionado', extra_service_group_id: 1 },
        { id: 3, title: 'Polimento de Farol', extra_service_group_id: null },
        { id: 4, title: 'Enceramento Técnico', extra_service_group_id: 1 },
        { id: 5, title: 'Limpeza do Motor', extra_service_group_id: null },
        { id: 6, title: 'Check-up de Bateria', extra_service_group_id: 2, description: "teste" },
    ];

    let groups = [
        { id: 1, name: 'Combo Limpeza Completa' },
        { id: 2, name: 'Pacote Verificação Rápida' },
    ];

    const baseUrl = "https://n8n.acesse.rodrigobrinate.com.br/webhook/831a9742-dc3c-4246-9283-65213099f9c6"
    // --- FIM DOS DADOS DE EXEMPLO ---


    const servicesListContainer = document.getElementById('services-list');
    const groupsListContainer = document.getElementById('groups-list');
    const createGroupBtn = document.getElementById('create-group-btn');
    const createServiceBtn = document.getElementById('create-service-btn');

    // Função principal que redesenha a tela com os dados atuais
    function render() {
        // Limpa as listas antes de redesenhar
        servicesListContainer.innerHTML = '';
        groupsListContainer.innerHTML = '';

        // Renderiza os Grupos
        groups?.[0]?.name ? groups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';
            groupCard.setAttribute('data-group-id', group.id);
            groupCard.innerHTML = `
                <div class="group-card-header">
                    <h3>${group.name}</h3>
                    <button class="delete-group-btn" data-group-id="${group.id}" title="Apagar Grupo">×</button>
                </div>
                <div class="drop-zone" data-group-id="${group.id}"></div>
            `;
            groupsListContainer.appendChild(groupCard);
        }) : console.log();

        // Renderiza os Serviços, colocando-os na lista correta (disponíveis ou dentro de um grupo)
        services.forEach(service => {
            const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.setAttribute('draggable', true);
        serviceCard.setAttribute('data-service-id', service.id);

        // --- INÍCIO DA ALTERAÇÃO ---

        // 1. Começamos com o título em negrito
       let cardHTML = `
            <div class="service-card-header">
                <strong>${service.title}</strong>
                <button class="delete-service-btn" data-service-id="${service.id}" title="Apagar Serviço">×</button>
            </div>
        `;

        // 2. Verificamos se a descrição existe e não está vazia
        if (service.description && service.description.trim() !== '') {
            // 3. Se existir, adicionamos um parágrafo com a descrição
            cardHTML += `<p class="service-description">${service.description}</p>`;
        }

        // 4. Inserimos o HTML completo no card
        serviceCard.innerHTML = cardHTML;
            
           

            if (service.extra_service_group_id) {
                const groupContainer = document.querySelector(`.group-card .drop-zone[data-group-id='${service.extra_service_group_id}']`);
                if(groupContainer) {
                    groupContainer.appendChild(serviceCard);
                } else {
                    // Caso o grupo tenha sido deletado, volta para a lista principal
                    service.extra_service_group_id = null;
                    servicesListContainer.appendChild(serviceCard);
                }
            } else {
                servicesListContainer.appendChild(serviceCard);
            }
        });

        // Re-adiciona todos os event listeners necessários para os elementos dinâmicos
        addEventListeners();
    }
    
    // Função para adicionar todos os event listeners
    function addEventListeners() {
        // Listeners para os cards de serviço (arrastar)
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        // Listeners para as zonas de soltar
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });
        
        // Listeners para os botões de apagar grupo
        document.querySelectorAll('.delete-group-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteGroup);
        });

        document.querySelectorAll('.delete-service-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteService);
        });


    }

    // --- LÓGICA DO DRAG AND DROP ---

    function handleDragStart(e) {
        e.target.classList.add('dragging');
        // Guarda o ID do serviço que está sendo arrastado
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-service-id'));
    }
    
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessário para permitir o 'drop'
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const serviceId = parseInt(e.dataTransfer.getData('text/plain'));
        const targetextra_service_group_idStr = e.currentTarget.getAttribute('data-group-id');
        const targetextra_service_group_id = targetextra_service_group_idStr === 'null' ? null : parseInt(targetextra_service_group_idStr);

        // Atualiza o estado dos dados
        const serviceToUpdate = services.find(s => s.id === serviceId);
        if (serviceToUpdate && serviceToUpdate.extra_service_group_id !== targetextra_service_group_id) {
            console.log(`Movendo serviço ${serviceId} para o grupo ${targetextra_service_group_id}`);
            serviceToUpdate.extra_service_group_id = targetextra_service_group_id;
            
            // TODO: Chamar API do Backend para atualizar o grupo do serviço
              fetch(baseUrl, { 
                 method: 'PUT', 
                 body: JSON.stringify({ extra_service_group_id: targetextra_service_group_id, id: serviceId }) 
             }).then(res => res.json()).then(servicesdb => {

            getServices(); // Re-renderiza a tela para refletir a mudança
        
             })}
    }


function getServices(){

     fetch(baseUrl, { 
                 method: 'GET', 
                 //body: JSON.stringify({ extra_service_group_id: targetextra_service_group_id }) 
             }).then(res => res.json()).then(servicesdb => {
                  // Atualiza o ID temporário com o ID real do banco
                    services = servicesdb
                   
                  render();
             });

}


function getGroups(){

     fetch(baseUrl+"/groups", { 
                 method: 'GET', 
                 //body: JSON.stringify({ extra_service_group_id: targetextra_service_group_id }) 
             }).then(res => res.json()).then(groupsdb => {
                  // Atualiza o ID temporário com o ID real do banco
                    groups = groupsdb
                  render();
             });

}
 getGroups()
getServices()



    // --- LÓGICA DOS GRUPOS ---

    function handleCreateGroup() {
        const groupName = prompt('Digite o nome do novo grupo:');
        if (groupName && groupName.trim() !== '') {
            const newextra_service_group_id = Date.now(); // ID temporário para o front-end
            const newGroup = { id: newextra_service_group_id, name: groupName.trim() };
            //groups.push(newGroup);
            
             //TODO: Chamar API do Backend para criar o novo grupo
              fetch(baseUrl+'/groups', { 
                 method: 'POST', 
                 body: JSON.stringify({ name: groupName.trim() }) 
             }).then(res => res.json()).then(createdGroup => {
                  // Atualiza o ID temporário com o ID real do banco
                  newGroup.id = createdGroup.id;
                  getGroups()
                  //render();
             });
            
            render();
        }
    }

function handleCreateService() {
        const serviceName = prompt('Digite o nome do novo serviço:');
        const serviceDescription = prompt('Digite a descriçao do novo serviço:');

        if (serviceName && serviceName.trim() !== '') {
            const newextra_service_group_id = Date.now(); // ID temporário para o front-end
            const newService = { id: newextra_service_group_id, title: serviceName.trim(),description: serviceDescription,  extra_service_group_id: null};
            //services.push(newService);
            
            // TODO: Chamar API do Backend para criar o novo grupo
              fetch(baseUrl, { 
                 method: 'POST', 
                 body: JSON.stringify({ name: serviceName.trim(), description:serviceDescription.trim()  }) 
             }).then(res => res.json()).then(createdService => {
                  // Atualiza o ID temporário com o ID real do banco
                  newService.id = createdService.id;
                  getServices();
             });
            
           // render();
        }
    }

    
    function handleDeleteGroup(e) {
        const extra_service_group_id = parseInt(e.currentTarget.getAttribute('data-group-id'));
        if (confirm(`Tem certeza que deseja apagar este grupo? Os serviços dentro dele voltarão para a lista de disponíveis.`)) {
          

            // TODO: Chamar API do Backend para deletar o grupo
              fetch(baseUrl+`/group/${extra_service_group_id}`, { 
                method: 'POST'
                
            }).then(res => res.json()).then(createdService => {
                  // Atualiza o ID temporário com o ID real do banco
                  newService.id = createdService.id;
                  getGroups();
                  getServices()
             }).finally(() => {
                 getGroups();
                  getServices()
             })
            
        }
    }



     function handleDeleteService(e) {
        const serviceId = parseInt(e.currentTarget.getAttribute('data-service-id'));
        if (confirm(`Tem certeza que deseja apagar este grupo? Os serviços dentro dele voltarão para a lista de disponíveis.`)) {
          

            // TODO: Chamar API do Backend para deletar o grupo
              fetch(baseUrl+`/${serviceId}`, { 
                method: 'POST'
                
            }).then(res => res.json()).then(createdService => {
                  // Atualiza o ID temporário com o ID real do banco
                  newService.id = createdService.id;
                 // getGroups();
                  getServices()
             }).finally(() => {
                 //getGroups();
                  getServices()
             })
            
        }
    }



    // Adiciona o listener para o botão de criar grupo
    createGroupBtn.addEventListener('click', handleCreateGroup);
    createServiceBtn.addEventListener('click', handleCreateService);
    
    // Renderização inicial
    render();
});